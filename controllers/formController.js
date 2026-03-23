const Contact = require("../models/Form");
const { formSchema } = require("./validation/formValidation");

// Create form
const createForm = async (req, res) => {
  try {
    // Validate form
    const { error } = formSchema.validate(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const { name, email, comment } = req.body;
    const file = req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` : null;

    const newContact = new Contact({ name, email, comment, file });
    await newContact.save();

    res.status(201).json({ msg: "Contact form submitted successfully", data: newContact });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Get all forms
const getAllForms = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ data: contacts });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

module.exports = { createForm, getAllForms };