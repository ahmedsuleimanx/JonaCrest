import fs from "fs";
import imagekit from "../config/imagekit.js";
import Property from "../models/propertymodel.js";

const addproperty = async (req, res) => {
    try {
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

        // Upload images to ImageKit and delete after upload
        const imageUrls = await Promise.all(
            images.map(async (item) => {
                const result = await imagekit.upload({
                    file: fs.readFileSync(item.path),
                    fileName: item.originalname,
                    folder: "Property",
                });
                fs.unlink(item.path, (err) => {
                    if (err) console.log("Error deleting the file: ", err);
                });
                return result.url;
            })
        );

        // Parse nested objects if they come as strings (common in multipart/form-data)
        let parsedAddress = address;
        let parsedCoordinates = coordinates;
        let parsedAmenities = amenities;

        if (typeof address === 'string') {
            try { parsedAddress = JSON.parse(address); } catch(e) { console.error("Error parsing address JSON", e); }
        }
        if (typeof coordinates === 'string') {
            try { parsedCoordinates = JSON.parse(coordinates); } catch(e) { console.error("Error parsing coordinates JSON", e); }
        }
         if (typeof amenities === 'string') {
            try { parsedAmenities = JSON.parse(amenities); } catch(e) { 
                 // If it's just a comma separated string, split it
                 parsedAmenities = amenities.split(',').map(s => s.trim());
            }
        }

        // Create a new product
        const product = new Property({
            title,
            description,
            price,
            currency: currency || 'GHS',
            type,
            listingType: listingType || 'Rent',
            availability,
            beds,
            baths,
            sqft,
            location,
            address: parsedAddress,
            coordinates: parsedCoordinates,
            amenities: parsedAmenities,
            image: imageUrls,
            phone,
            videoUrl,
            featured: featured === 'true' || featured === true,
            // ownerId: req.user._id // Uncomment when auth middleware is fully verified for this route
        });

        // Save the product to the database
        await product.save();

        res.json({ message: "Property added successfully", success: true });
    } catch (error) {
        console.log("Error adding property: ", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

// List all properties with optional filters
const listproperty = async (req, res) => {
    try {
        const { 
            search, type, listingType, minPrice, maxPrice,
            beds, baths, location, limit = 20, page = 1, featured, ownerId
        } = req.query;

        let query = {};

        // Filter by ownerId
        if (ownerId) query.ownerId = ownerId;

        // Search by title, description, or location
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by type
        if (type) query.type = type;

        // Filter by listing type (Rent, Sale, Short Stay)
        if (listingType) query.listingType = listingType;

        // Filter by price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseInt(minPrice);
            if (maxPrice) query.price.$lte = parseInt(maxPrice);
        }

        // Filter by beds/baths
        if (beds) query.beds = { $gte: parseInt(beds) };
        if (baths) query.baths = { $gte: parseInt(baths) };

        // Filter by location
        if (location) query.location = { $regex: location, $options: 'i' };

        // Filter featured only
        if (featured === 'true') query.featured = true;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [products, total] = await Promise.all([
            Property.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Property.countDocuments(query)
        ]);

        res.json({
            products,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            success: true
        });
    } catch (error) {
        console.log("Error listing properties:", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

// Remove a property
const removeproperty = async (req, res) => {
    try {
        const { id } = req.body;
        
        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }

        await Property.findByIdAndDelete(id);
        res.json({ message: "Property removed successfully", success: true });
    } catch (error) {
        console.log("Error removing property:", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const updateproperty = async (req, res) => {
    try {
        const { 
            id, title, description, price, currency,
            type, listingType, availability,
            beds, baths, sqft,
            location, address, coordinates,
            amenities, phone, videoUrl, featured
        } = req.body;

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }

        // Parse nested objects
        let parsedAddress = address;
        let parsedCoordinates = coordinates;
        let parsedAmenities = amenities;

        if (typeof address === 'string') {
            try { parsedAddress = JSON.parse(address); } catch(e) { console.error("Error parsing address", e); }
        }
        if (typeof coordinates === 'string') {
            try { parsedCoordinates = JSON.parse(coordinates); } catch(e) { console.error("Error parsing coordinates", e); }
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


        if (!req.files || (Object.keys(req.files).length === 0)) {
            // No new images provided, just save text fields
            await property.save();
            return res.json({ message: "Property updated successfully", success: true });
        }

        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        // Upload new images
        const imageUrls = await Promise.all(
            images.map(async (item) => {
                const result = await imagekit.upload({
                    file: fs.readFileSync(item.path),
                    fileName: item.originalname,
                    folder: "Property",
                });
                fs.unlink(item.path, (err) => {
                    if (err) console.log("Error deleting the file: ", err);
                });
                return result.url;
            })
        );
        
        // Append or replace? Usually replace in this simple logic, or logic to keep old ones necessary
        // For MVP, if ANY new image is uploaded, we might want to just append or replace. 
        // The previous logic replaced ALL images if new ones came. We'll stick to that or better:
        // property.image = [...property.image, ...imageUrls]; // Append
        property.image = imageUrls; // Replace (as per original logic seeming implication)

        await property.save();
        res.json({ message: "Property updated successfully", success: true });
    } catch (error) {
        console.log("Error updating property: ", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const singleproperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findById(id).populate('ownerId', 'name image role email phone companyName agencyName');
        if (!property) {
            return res.status(404).json({ message: "Property not found", success: false });
        }
        res.json({ property, success: true });
    } catch (error) {
        console.log("Error fetching property:", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

export { addproperty, listproperty, removeproperty, updateproperty , singleproperty};