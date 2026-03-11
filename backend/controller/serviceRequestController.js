import ServiceRequest from '../models/serviceRequestModel.js';
import transporter from "../config/nodemailer.js";

export const createServiceRequest = async (req, res) => {
    try {
        const { serviceType, details, location, scheduledDate, contactPhone } = req.body;
        const userId = req.user._id; 

        let parsedLocation = location;
        if (typeof location === 'string') {
            parsedLocation = { address: location };
        }

        const serviceRequest = new ServiceRequest({
            userId,
            serviceType,
            details,
            location: parsedLocation,
            scheduledDate,
            contactPhone
        });

        await serviceRequest.save();

        // Send confirmation email
        // const mailOptions = { ... } // (Implementation similar to existing email logic)

        res.status(201).json({ success: true, message: 'Service request submitted successfully', serviceRequest });
    } catch (error) {
        console.error('Error creating service request:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getUserServiceRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const requests = await ServiceRequest.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (error) {
        console.error('Error fetching service requests:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getAllServiceRequests = async (req, res) => {
    try {
        // Admin only
        const serviceRequests = await ServiceRequest.find()
            .populate('userId', 'name email phone')
            .populate('propertyId', 'title address location')
            .sort({ createdAt: -1 });
        res.json({ success: true, serviceRequests });
    } catch (error) {
        console.error('Error fetching all service requests:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateServiceRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const updateData = { status };

        if (status === 'approved') {
            updateData.approvedAt = new Date();
            updateData.approvedBy = req.user?._id || req.body.adminId;
        }

        if (adminNotes !== undefined) {
            updateData.adminNotes = adminNotes;
        }

        const request = await ServiceRequest.findByIdAndUpdate(id, updateData, { new: true })
            .populate('userId', 'name email phone')
            .populate('propertyId', 'title address location');
        
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        res.json({ success: true, message: `Request ${status} successfully`, serviceRequest: request });
    } catch (error) {
        console.error('Error updating service request status:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
