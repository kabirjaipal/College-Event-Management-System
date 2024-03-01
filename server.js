import express from "express";
import bodyParser from "body-parser";
import passport from "passport";
import LocalStrategy from "passport-local";
import session from "express-session";
import User from "./models/User.js";
import ApplicationModel from "./models/ApplicationModel.js";
import multer from "multer";
import connectDB from "./handlers/connectToDB.js";
import bcrypt from "bcrypt";
import flash from "express-flash";
import compression from "compression";
import cookieParser from "cookie-parser";
import path from "path";
import { createUsername, generatePassword } from "./handlers/functions.js";
import mentors from "./handlers/mentors.js";
import nodemailer from "nodemailer";
import config from "./config.js";
import Mail from "nodemailer/lib/mailer/index.js";
import cors from "cors";
import methodOverride from "method-override";
import MemoryStore from "memorystore";
import { Types, startSession } from "mongoose";

const static_path = path.join("public");
const app = express();

const MemoryStoreWithSession = MemoryStore(session);

app.set("view engine", "ejs");

// Middleware
app.use(express.static(static_path));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.use(
  cors({
    origin: config.RedirectUrl,
  })
);
// app.use(helmet());
app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL-encoded form data parser
app.use(cookieParser()); // Cookie parser
app.use(
  session({
    secret: config.SessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // Set the session max age to 24 hours
    },
    store: new MemoryStoreWithSession({
      checkPeriod: 24 * 60 * 60 * 1000, // Prune expired entries every 24 hours
    }),
  })
); // Session management
app.use(passport.initialize()); // Passport initialization
app.use(passport.session()); // Persistent login sessions
app.use(flash()); // Flash messages
app.use(compression()); // Response compression

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).fields([
  { name: "image", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
]);

// Passport Configuration
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      const user = await User.findOne({ email: email });

      if (!user) {
        return done(null, false, {
          message: "User not found. Please register.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return done(null, false, { message: "Incorrect credentials" });
      }

      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  // res.status(500).send("Internal Server Error");
  res.render("error", {
    message: `${err.message}`,
    prevUrl: req.session.prevUrl || "/",
  });
});

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// Middleware to check if the user is not authenticated
function isNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

// Middleware to check if the user is admin
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.redirect("/login");
}

// Set up Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.EmailUser, // replace with your email
    pass: config.EmailPassword, // replace with your email password
  },
});

// Routes
app.get("/adminDashboard", isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "username email").lean();

    res.render("adminDashboard", {
      user: req.user || null,
      users: users,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.render("error", {
      message: "Internal Server Error",
      prevUrl: "/adminDashboard",
    });
  }
});

app.get("/dashboard", isAuthenticated, async (req, res) => {
  // code
  const form = await ApplicationModel.findOne({ email: req.user.email });

  res.render("dashboard", {
    user: req.user,
    form: form,
  });
});

app.get("/", (req, res) => {
  res.render("home", {
    user: req.user || null,
  });
});

app.get("/about", async (req, res) => {
  res.render("aboutpage", {
    user: req.user || null,
  });
});

app.get("/mentor", async (req, res) => {
  res.render("mentorpage", {
    mentorsList: mentors,
    user: req.user || null,
  });
});

app.get("/login", isNotAuthenticated, (req, res) => {
  res.render("login", { user: req.user || null });
});

app.post(
  "/login",
  isNotAuthenticated,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const { user } = req;
    if (user.role === "admin") {
      res.redirect("/adminDashboard");
    } else {
      res.redirect("/dashboard");
    }
  }
);

app.get("/register", isNotAuthenticated, (req, res) => {
  res.render("register", {
    user: req.user || null,
  });
});

app.post("/register", async (req, res) => {
  try {
    let fees = req.body.participantStatus === "student" ? 800 : 1200;

    const isFormSubmitted = await ApplicationModel.findOne({
      email: req.body.email,
    });

    if (isFormSubmitted) {
      return res.render("error", {
        message: "User form with this email already exists.",
        prevUrl: "/register",
      });
    }

    const session = await startSession();
    session.startTransaction();

    try {
      const form = new ApplicationModel({
        name: req.body.name,
        address: req.body.address,
        department: req.body.department,
        designation: req.body.designation,
        email: req.body.email,
        mobileNumber: req.body.mobileNumber,
        Organization: req.body.Organization,
        participantStatus: req.body.participantStatus,
        presentation: req.body.presentation,
        RegistrationFee: fees,
      });

      await form.save({ session });

      const randomPassword = generatePassword();
      const username = createUsername(req.body.name);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const newUser = new User({
        email: req.body.email,
        password: hashedPassword,
        username: username,
      });

      await newUser.save({ session });

      await session.commitTransaction();

      // Send an email with the generated password
      /**
       * @type {Mail.Options}
       */
      const mailOptions = {
        from: "kabirjaipal447@gmail.com", // replace with your email
        to: `${req.body.email}`,
        subject: "Registration Successful",
        html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>Dear ${req.body.name},</h2>
      
      <p>Congratulations! You have successfully registered for ${config.EventName} at ${config.OrganizationName}.</p>
      
      <div style="background-color: #f8f8f8; padding: 10px; border-radius: 5px; margin-top: 20px;">
        <p><strong>Email:</strong> ${req.body.email}</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${randomPassword}</p>
      </div>

      <p>We look forward to your participation. If you have any questions or concerns, feel free to contact us at <a href="mailto:${config.EmailUser}">${config.EmailUser}</a>.</p>

      <p style="margin-top: 30px;">Best Regards,<br>${config.OrganizationName}</p>
    </div>
  `,
      };

      await transporter.sendMail(mailOptions);

      return res.render("success", {
        message:
          "Thank you for registering! Your registration was successful. We've sent you an email with further instructions.",
        prevUrl: "/dashboard",
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error(error);
    return res.render("error", {
      message: "Internal Server Error",
      prevUrl: "/register",
    });
  }
});

app.delete("/users", isAdmin, async (req, res) => {
  try {
    const userId = new Types.ObjectId(req.body.userId);
    const loggedInUserId = req.user._id;

    if (loggedInUserId.equals(userId)) {
      return res.render("error", {
        message: "Unable to proceed: You cannot delete your own account.",
        prevUrl: "/adminDashboard",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.render("error", {
        message: "User not found: The specified user does not exist.",
        prevUrl: "/adminDashboard",
      });
    }

    await Promise.all([
      ApplicationModel.deleteMany({ email: user.email }),
      User.deleteMany({ email: user.email }),
    ]);

    return res.redirect("/adminDashboard");
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: `Internal Server Error: ${error.message}`,
      prevUrl: "/adminDashboard",
    });
  }
});

app.put("/users", isAdmin, async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (!user) {
    return res.render("error", {
      message: "User not found: The specified user does not exist.",
      prevUrl: "/adminDashboard",
    });
  }
  return res.redirect(`/updateForm/${user._id}`);
});

// updateForm
app.get("/updateForm/:userId", isAdmin, async (req, res) => {
  try {
    // code
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.render("error", {
        message: "User not found: The specified user does not exist.",
        prevUrl: "/adminDashboard",
      });
    }
    const form = await ApplicationModel.findOne({ email: user.email });
    if (!form) {
      return res.render("error", {
        message:
          "Form not found: The application form associated with this user is missing.",
        prevUrl: "/adminDashboard",
      });
    }

    return res.render("updateForm", {
      form: form,
      user: user,
    });
  } catch (error) {
    console.error(error);
    return res.render("error", {
      message: `Error: ${error.message}`,
      prevUrl: "/adminDashboard",
    });
  }
});

app.post("/updateForm", isAdmin, async (req, res) => {
  try {
    const filter = { email: req.body.email };
    const update = {
      $set: {
        name: req.body.name,
        email: req.body.email,
        mobileNumber: req.body.mobileNumber,
        designation: req.body.designation,
        Organization: req.body.Organization,
        department: req.body.department,
        participantStatus: req.body.participantStatus,
        presentation: req.body.presentation,
        address: req.body.address,
      },
    };

    const updatedForm = await ApplicationModel.findOneAndUpdate(
      filter,
      update,
      {
        new: true,
        upsert: false,
      }
    );

    if (!updatedForm) {
      return res.render("error", {
        message: "User form with this email doesn't exist.",
        prevUrl: "/adminDashboard",
      });
    }

    return res.render("success", {
      message: `${updatedForm.name}'s Application is Updated`,
      prevUrl: "/adminDashboard",
    });
  } catch (error) {
    console.error(error);
    return res.render("error", {
      message: `Error: ${error.message}`,
      prevUrl: "/adminDashboard",
    });
  }
});

app.get("/profile", isAuthenticated, (req, res) => {
  res.render("profile", {
    user: req.user || null,
  });
});

app.post("/update-profile", isAuthenticated, async (req, res) => {
  const { currentPassword, newPassword, username } = req.body;

  try {
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, req.user.password);
      if (!isMatch) {
        req.flash("error", "Current password is incorrect.");
        return res.redirect("/profile");
      }

      req.user.password = await bcrypt.hash(newPassword, 10);
      req.flash("success", "Password updated successfully.");
    }

    if (req.user.username !== username) {
      req.user.username = username;
      req.flash("success", "Username updated successfully.");
    }

    await req.user.save();

    return res.redirect("/profile");
  } catch (error) {
    console.error("Error updating profile:", error);
    req.flash("error", "An error occurred while updating your profile.");
    return res.redirect("/profile");
  }
});

// Handle Payment
app.post("/upload", isAuthenticated, upload, async (req, res) => {
  try {
    const form = await ApplicationModel.findOne({
      email: req.user.email,
    });

    if (!form) {
      return res.status(400).render("error", {
        message: "User with this email does not exist.",
        prevUrl: "/dashboard",
      });
    }

    const imgFile = req.files.image ? req.files.image[0] : null;
    const pdfFile = req.files.pdf ? req.files.pdf[0] : null;

    form.paymentdate = Date.now();

    // Saving File
    if (pdfFile) {
      form.pdfFile.data = pdfFile.buffer;
      form.pdfFile.contentType = pdfFile.mimetype;
      form.pdfFile.filename = pdfFile.originalname;
    }

    if (imgFile) {
      form.ImageFile.data = imgFile.buffer;
      form.ImageFile.contentType = imgFile.mimetype;
      form.ImageFile.filename = imgFile.originalname;
    }

    await form.save();

    return res.render("success", {
      message: "Your Research Paper Successfully Submitted",
      prevUrl: "/dashboard",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).render("error", {
      message: "Submission Failed: Unable to Save File",
      prevUrl: "/dashboard",
    });
  }
});

// Retrieve and download the PDF file
app.get("/download/pdf", isAuthenticated, async (req, res) => {
  try {
    const application = await ApplicationModel.findOne({
      email: req.user.email,
    });

    if (!application) {
      return res.render("error", {
        message:
          "Application not found: No application associated with your account.",
        prevUrl: "/adminDashboard",
      });
    }

    res.set({
      "Content-Type": application.pdfFile.contentType,
      "Content-Disposition": `attachment; filename=${application.pdfFile.filename}.pdf`,
    });

    res.send(application.pdfFile.data);
  } catch (error) {
    console.error(error);
    return res.render("error", {
      message: "Internal Server Error",
      prevUrl: "/adminDashboard",
    });
  }
});

app.post("/download/pdf", isAdmin, async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.render("error", {
        message: "User not found: The specified user does not exist.",
        prevUrl: "/adminDashboard",
      });
    }
    const application = await ApplicationModel.findOne({
      email: user.email,
    });

    if (!application) {
      return res.render("error", {
        message:
          "Application not found: No application associated with your account.",
        prevUrl: "/adminDashboard",
      });
    }

    res.set({
      "Content-Type": application.pdfFile.contentType,
      "Content-Disposition": `attachment; filename=${application.pdfFile.filename}.pdf`,
    });

    return res.send(application.pdfFile.data);
  } catch (error) {
    console.error(error);
    return res.render("error", {
      message: "Internal Server Error",
      prevUrl: "/adminDashboard",
    });
  }
});

// Retrieve and download the Image file
app.get("/download/img", isAuthenticated, async (req, res) => {
  try {
    const application = await ApplicationModel.findOne({
      email: req.user.email,
    });

    if (!application) {
      return res.render("error", {
        message:
          "Application not found: No application associated with your account.",
        prevUrl: "/adminDashboard",
      });
    }
    res.set({
      "Content-Type": application.ImageFile.contentType,
      "Content-Disposition": `attachment; filename=${application.ImageFile.filename}.png`,
    });

    res.send(application.ImageFile.data);
  } catch (error) {
    console.error(error);
    return res.render("error", {
      message: "Internal Server Error",
      prevUrl: "/adminDashboard",
    });
  }
});

app.post("/download/img", isAdmin, async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.render("error", {
        message: "User not found: The specified user does not exist.",
        prevUrl: "/adminDashboard",
      });
    }
    const application = await ApplicationModel.findOne({
      email: user.email,
    });

    if (!application) {
      return res.render("error", {
        message:
          "Application not found: No application associated with your account.",
        prevUrl: "/adminDashboard",
      });
    }
    res.set({
      "Content-Type": application.ImageFile.contentType,
      "Content-Disposition": `attachment; filename=${application.ImageFile.filename}.png`,
    });

    return res.send(application.ImageFile.data);
  } catch (error) {
    console.error(error);
    return res.render("error", {
      message: "Internal Server Error",
      prevUrl: "/adminDashboard",
    });
  }
});

app.get("/logout", (req, res) => {
  req.logout({ keepSessionInfo: false }, (err) => {});
  res.redirect("/");
});

// Start the server
app.listen(config.Port, async () => {
  await connectDB();
  console.log(`Server is running at http://localhost:${config.Port}`);
});
