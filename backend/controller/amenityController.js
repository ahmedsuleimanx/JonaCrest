import Amenity from '../models/amenityModel.js';

export const getAllAmenities = async (req, res) => {
    try {
        const amenities = await Amenity.find().sort({ name: 1 });
        res.json({ success: true, amenities });
    } catch (error) {
        console.error('Error fetching amenities:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const createAmenity = async (req, res) => {
    try {
        const { name, icon, category, description } = req.body;
        
        const existingAmenity = await Amenity.findOne({ name });
        if (existingAmenity) {
            return res.status(400).json({ success: false, message: 'Amenity already exists' });
        }

        const amenity = new Amenity({
            name,
            icon,
            category,
            description
        });

        await amenity.save();
        res.status(201).json({ success: true, message: 'Amenity created successfully', amenity });
    } catch (error) {
        console.error('Error creating amenity:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const deleteAmenity = async (req, res) => {
    try {
        const { id } = req.params;
        const amenity = await Amenity.findByIdAndDelete(id);
        
        if (!amenity) {
            return res.status(404).json({ success: false, message: 'Amenity not found' });
        }

        res.json({ success: true, message: 'Amenity deleted successfully' });
    } catch (error) {
        console.error('Error deleting amenity:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
