import Property from '../models/propertymodel.js';
import aiService from '../services/aiService.js';

/**
 * Search properties from local database and analyze with AI
 */
export const searchProperties = async (req, res) => {
    try {
        const { city, maxPrice, propertyCategory, propertyType, limit = 6 } = req.body;

        if (!city || !maxPrice) {
            return res.status(400).json({ success: false, message: 'City and maxPrice are required' });
        }

        // Build search query for local database
        const query = {
            $or: [
                { location: { $regex: city, $options: 'i' } },
                { 'address.city': { $regex: city, $options: 'i' } },
                { 'address.region': { $regex: city, $options: 'i' } }
            ],
            price: { $lte: parseFloat(maxPrice) },
            availability: 'Available'
        };

        // Add property type filter if provided
        if (propertyType && propertyType !== 'Any') {
            query.type = { $regex: propertyType, $options: 'i' };
        }

        // Add listing type filter based on category
        if (propertyCategory === 'Rent' || propertyCategory === 'Rental') {
            query.listingType = 'Rent';
        } else if (propertyCategory === 'Sale' || propertyCategory === 'Buy') {
            query.listingType = 'Sale';
        }

        // Fetch properties from database
        const properties = await Property.find(query)
            .limit(Math.min(limit, 6))
            .sort({ featured: -1, createdAt: -1 });

        // Transform to format expected by AI service
        const formattedProperties = properties.map(p => ({
            building_name: p.title,
            property_type: p.type,
            location_address: p.location,
            price: p.price,
            currency: p.currency || 'GHS',
            area_sqft: p.sqft,
            beds: p.beds,
            baths: p.baths,
            amenities: p.amenities || [],
            description: p.description,
            image: p.image?.[0] || ''
        }));

        // Analyze the properties using AI
        let analysis = '';
        if (formattedProperties.length > 0) {
            try {
                analysis = await aiService.analyzeProperties(
                    formattedProperties,
                    city,
                    maxPrice,
                    propertyCategory || 'Any',
                    propertyType || 'Any'
                );
            } catch (aiError) {
                console.error('AI analysis failed:', aiError.message);
                analysis = 'AI analysis temporarily unavailable. Please review the properties listed above.';
            }
        }

        res.json({
            success: true,
            properties: formattedProperties,
            analysis,
            total: formattedProperties.length
        });
    } catch (error) {
        console.error('Error searching properties:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to search properties',
            error: error.message
        });
    }
};

/**
 * Get location trends from local database with AI analysis
 */
export const getLocationTrends = async (req, res) => {
    try {
        const { city } = req.params;
        const { limit = 5 } = req.query;

        if (!city) {
            return res.status(400).json({ success: false, message: 'City parameter is required' });
        }

        // Aggregate properties by location within the city
        const locationStats = await Property.aggregate([
            {
                $match: {
                    $or: [
                        { location: { $regex: city, $options: 'i' } },
                        { 'address.city': { $regex: city, $options: 'i' } }
                    ],
                    availability: 'Available'
                }
            },
            {
                $group: {
                    _id: '$location',
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    count: { $sum: 1 },
                    avgSqft: { $avg: '$sqft' },
                    properties: { $push: { title: '$title', price: '$price', type: '$type' } }
                }
            },
            { $sort: { count: -1 } },
            { $limit: parseInt(limit) }
        ]);

        // Format location data
        const locations = locationStats.map(loc => ({
            location: loc._id,
            averagePrice: Math.round(loc.avgPrice),
            priceRange: `${Math.round(loc.minPrice).toLocaleString()} - ${Math.round(loc.maxPrice).toLocaleString()}`,
            propertyCount: loc.count,
            averageSqft: Math.round(loc.avgSqft || 0),
            pricePerSqft: loc.avgSqft ? Math.round(loc.avgPrice / loc.avgSqft) : 0
        }));

        // Analyze the location trends using AI
        let analysis = '';
        if (locations.length > 0) {
            try {
                analysis = await aiService.analyzeLocationTrends(locations, city);
            } catch (aiError) {
                console.error('AI location analysis failed:', aiError.message);
                analysis = 'Location trend analysis temporarily unavailable.';
            }
        }

        res.json({
            success: true,
            locations,
            analysis,
            city
        });
    } catch (error) {
        console.error('Error getting location trends:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get location trends',
            error: error.message
        });
    }
};