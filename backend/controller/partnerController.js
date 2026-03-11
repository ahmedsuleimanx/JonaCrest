import Partner from '../models/partnerModel.js';
import { v2 as cloudinary } from 'cloudinary';

// GET all partners (public)
export const getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, partners });
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch partners' });
  }
};

// GET single partner
export const getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    res.json({ success: true, partner });
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch partner' });
  }
};

// CREATE partner (admin only)
export const createPartner = async (req, res) => {
  try {
    const { name, website, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Partner name is required' });
    }

    let logoUrl = '';
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'partners', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      logoUrl = result.secure_url;
    }

    const partner = new Partner({
      name: name.trim(),
      logo: logoUrl,
      website: website || '',
      description: description || ''
    });

    await partner.save();
    res.status(201).json({ success: true, partner, message: 'Partner created successfully' });
  } catch (error) {
    console.error('Error creating partner:', error);
    res.status(500).json({ success: false, message: 'Failed to create partner' });
  }
};

// UPDATE partner (admin only)
export const updatePartner = async (req, res) => {
  try {
    const { name, website, description, isActive } = req.body;
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    if (name) partner.name = name.trim();
    if (website !== undefined) partner.website = website;
    if (description !== undefined) partner.description = description;
    if (isActive !== undefined) partner.isActive = isActive;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'partners', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      partner.logo = result.secure_url;
    }

    await partner.save();
    res.json({ success: true, partner, message: 'Partner updated successfully' });
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(500).json({ success: false, message: 'Failed to update partner' });
  }
};

// DELETE partner (admin only)
export const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    res.json({ success: true, message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json({ success: false, message: 'Failed to delete partner' });
  }
};
