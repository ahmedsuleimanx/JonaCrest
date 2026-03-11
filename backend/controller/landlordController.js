import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import User from '../models/Usermodel.js';
import Product from '../models/propertymodel.js';
import Viewing from '../models/viewingModel.js';

/**
 * Get landlord dashboard stats
 */
export const getLandlordStats = async (req, res) => {
    try {
        const landlordId = req.user._id;
        
        const [properties, viewings] = await Promise.all([
            Product.find({ ownerId: landlordId }),
            Viewing.find({ landlordId })
        ]);

        const totalProperties = properties.length;
        const activeProperties = properties.filter(p => p.status === 'active').length;
        const pendingViewings = viewings.filter(v => v.status === 'Pending').length;
        const confirmedViewings = viewings.filter(v => v.status === 'Confirmed').length;

        res.json({
            success: true,
            stats: {
                totalProperties,
                activeProperties,
                pendingViewings,
                confirmedViewings,
                totalViews: properties.reduce((sum, p) => sum + (p.views || 0), 0)
            }
        });
    } catch (error) {
        console.error('Error getting landlord stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
};

/**
 * Get landlord's properties
 */
export const getLandlordProperties = async (req, res) => {
    try {
        const landlordId = req.user._id;
        const properties = await Product.find({ ownerId: landlordId }).sort({ createdAt: -1 });
        res.json({ success: true, properties });
    } catch (error) {
        console.error('Error getting landlord properties:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch properties' });
    }
};

/**
 * Get viewing requests for landlord's properties
 */
export const getLandlordViewings = async (req, res) => {
    try {
        const landlordId = req.user._id;
        const viewings = await Viewing.find({ landlordId })
            .populate('propertyId', 'title image location')
            .populate('userId', 'name email phone')
            .sort({ date: -1 });

        res.json({ success: true, viewings });
    } catch (error) {
        console.error('Error getting landlord viewings:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch viewings' });
    }
};

/**
 * Update viewing status (approve, reject, reschedule)
 */
export const updateViewingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const landlordId = req.user._id;

        const viewing = await Viewing.findOne({ _id: id, landlordId });
        if (!viewing) {
            return res.status(404).json({ success: false, message: 'Viewing not found' });
        }

        viewing.status = status;
        if (notes) viewing.notes = notes;
        await viewing.save();

        res.json({ success: true, viewing, message: `Viewing ${status.toLowerCase()}` });
    } catch (error) {
        console.error('Error updating viewing status:', error);
        res.status(500).json({ success: false, message: 'Failed to update viewing' });
    }
};

/**
 * Create/Add a property (for landlord)
 */
export const addLandlordProperty = async (req, res) => {
    try {
        const landlordId = req.user._id;
        const { 
            title, description, price, currency,
            type, listingType, availability,
            beds, baths, sqft,
            location, address, coordinates,
            amenities, phone, videoUrl, featured
        } = req.body;

        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        // Upload images to Cloudinary
        const imageUrls = await Promise.all(
            images.map(async (item) => {
                const result = await cloudinary.uploader.upload(item.path, {
                    folder: "JonaCrestProperties/Properties",
                    resource_type: "image"
                });
                fs.unlink(item.path, (err) => {
                    if (err) console.log("Error deleting the file: ", err);
                });
                return result.secure_url;
            })
        );

        // Parse nested objects
        let parsedAddress = address;
        let parsedCoordinates = coordinates;
        let parsedAmenities = amenities;

        if (typeof address === 'string') {
            try { parsedAddress = JSON.parse(address); } catch(e) { }
        }
        if (typeof coordinates === 'string') {
            try { parsedCoordinates = JSON.parse(coordinates); } catch(e) { }
        }
        if (typeof amenities === 'string') {
            try { parsedAmenities = JSON.parse(amenities); } catch(e) { 
                 parsedAmenities = amenities.split(',').map(s => s.trim());
            }
        }

        const property = new Product({
            title, description, price, 
            currency: currency || 'GHS',
            type, listingType: listingType || 'Rent',
            availability, beds, baths, sqft,
            location,
            address: parsedAddress,
            coordinates: parsedCoordinates,
            amenities: parsedAmenities,
            image: imageUrls,
            phone, videoUrl,
            featured: featured === 'true' || featured === true,
            ownerId: landlordId
        });

        await property.save();

        res.status(201).json({ success: true, property, message: 'Property added successfully' });
    } catch (error) {
        console.error('Error adding property:', error);
        res.status(500).json({ success: false, message: 'Failed to add property' });
    }
};

/**
 * Update a property
 */
export const updateLandlordProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const landlordId = req.user._id;
        const { 
            title, description, price, currency,
            type, listingType, availability,
            beds, baths, sqft,
            location, address, coordinates,
            amenities, phone, videoUrl, featured
        } = req.body;

        const property = await Product.findOne({ _id: id, ownerId: landlordId });

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        // Parse nested objects
        let parsedAddress = address;
        let parsedCoordinates = coordinates;
        let parsedAmenities = amenities;

        if (typeof address === 'string') {
            try { parsedAddress = JSON.parse(address); } catch(e) { }
        }
        if (typeof coordinates === 'string') {
            try { parsedCoordinates = JSON.parse(coordinates); } catch(e) { }
        }
        if (typeof amenities === 'string') {
             try { parsedAmenities = JSON.parse(amenities); } catch(e) { 
                 parsedAmenities = amenities.split(',').map(s => s.trim());
            }
        }

        // Update fields
        property.title = title || property.title;
        property.description = description || property.description;
        property.price = price || property.price;
        property.currency = currency || property.currency;
        property.type = type || property.type;
        property.listingType = listingType || property.listingType;
        property.availability = availability || property.availability;
        property.beds = beds || property.beds;
        property.baths = baths || property.baths;
        property.sqft = sqft || property.sqft;
        property.location = location || property.location;
        if(parsedAddress) property.address = parsedAddress;
        if(parsedCoordinates) property.coordinates = parsedCoordinates;
        if(parsedAmenities) property.amenities = parsedAmenities;
        property.phone = phone || property.phone;
        property.videoUrl = videoUrl || property.videoUrl;
        if (featured !== undefined) property.featured = featured === 'true' || featured === true;


        // Handle Image Updates
        // 1. Get existing images retained by user
        let existingImages = req.body.existingImages || [];
        if (typeof existingImages === 'string') {
            try {
                // Try parsing as JSON array if sent that way
                const parsed = JSON.parse(existingImages);
                if (Array.isArray(parsed)) existingImages = parsed;
                else existingImages = [existingImages];
            } catch (e) {
                // If not JSON, it's a single URL string
                existingImages = [existingImages];
            }
        } else if (!Array.isArray(existingImages)) {
            existingImages = [];
        }

        // 2. Upload new images
        let newImageUrls = [];
        if (req.files && Object.keys(req.files).length > 0) {
            const image1 = req.files.image1 && req.files.image1[0];
            const image2 = req.files.image2 && req.files.image2[0];
            const image3 = req.files.image3 && req.files.image3[0];
            const image4 = req.files.image4 && req.files.image4[0];

            const imagesToUpload = [image1, image2, image3, image4].filter((item) => item !== undefined);

            newImageUrls = await Promise.all(
                imagesToUpload.map(async (item) => {
                    const result = await cloudinary.uploader.upload(item.path, {
                        folder: "JonaCrestProperties/Properties",
                        resource_type: "image"
                    });
                    try {
                        fs.unlink(item.path, (err) => {
                             if (err) console.error("Error deleting temp file:", err);
                        });
                    } catch(e) { console.error("Unlink error", e); }
                    return result.secure_url;
                })
            );
        }

        // 3. Combine and limit to 4 (or whatever limit)
        // If NO images textually sent and NO files uploaded, do we clear all?
        // Yes, if existingImages is empty and no new files, property has 0 images.
        // Unless frontend sends undefined. Frontend MUST send existingImages array (empty or not).
        
        // However, to cover "only updating text fields" case:
        // If existingImages is NOT in body, it means we probably didn't touch images?
        // No, standard FormData from our frontend should include it. 
        // We will update frontend to ALWAYS send 'existingImages'.
        
        const finalImages = [...existingImages, ...newImageUrls];
        property.image = finalImages;

        await property.save();

        res.json({ success: true, property, message: 'Property updated successfully' });
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({ success: false, message: 'Failed to update property' });
    }
};

/**
 * Delete a property
 */
export const deleteLandlordProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const landlordId = req.user._id;

        const property = await Product.findOneAndDelete({ _id: id, ownerId: landlordId });

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        res.json({ success: true, message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ success: false, message: 'Failed to delete property' });
    }
};
