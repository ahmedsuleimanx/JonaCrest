import Viewing from '../models/viewingModel.js';
import Property from '../models/propertymodel.js';
import transporter from "../config/nodemailer.js";
import { createNotificationHelper } from './notificationController.js';

export const scheduleViewing = async (req, res) => {
    try {
        const { propertyId, date, timeSlot, type, notes, userId: providedUserId } = req.body;
        
        let userId = req.user._id;

        // Allow agents/admins to schedule for others
        if ((req.user.role === 'agent' || req.user.role === 'admin') && providedUserId) {
            userId = providedUserId;
        }

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const viewing = new Viewing({
            propertyId,
            userId,
            agentId: property.ownerId, // Assign to property owner/agent
            date,
            timeSlot,
            type,
            notes
        });

        await viewing.save();

        // Create notification for the user
        try {
            await createNotificationHelper(
                userId,
                'viewing_request',
                'Viewing Scheduled',
                `Your viewing for "${property.title}" has been scheduled for ${new Date(date).toLocaleDateString()}.`,
                { viewingId: viewing._id, propertyId },
                '/dashboard/viewings'
            );
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        res.status(201).json({ success: true, message: 'Viewing scheduled successfully', viewing });
    } catch (error) {
        console.error('Error scheduling viewing:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getUserViewings = async (req, res) => {
    try {
        const userId = req.user._id;
        const viewings = await Viewing.find({ userId })
            .populate('propertyId', 'title location image price')
            .sort({ date: -1 });
        res.json({ success: true, viewings });
    } catch (error) {
        console.error('Error fetching user viewings:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getAgentViewings = async (req, res) => {
    try {
        // Assuming the logged in user is an agent/landlord
        const agentId = req.user._id;
        const viewings = await Viewing.find({ agentId })
            .populate('propertyId', 'title')
            .populate('userId', 'name email phone')
            .sort({ date: 1 });
        res.json({ success: true, viewings });
    } catch (error) {
        console.error('Error fetching agent viewings:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const checkMapAccess = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const userId = req.user._id;

        // Check if user has any confirmed/completed viewing with map access granted for this property
        const viewing = await Viewing.findOne({
            propertyId,
            userId,
            status: { $in: ['confirmed', 'completed'] },
            mapAccessGranted: true
        });

        res.json({
            success: true,
            hasAccess: !!viewing,
            viewing: viewing ? { _id: viewing._id, status: viewing.status, mapAccessGrantedAt: viewing.mapAccessGrantedAt } : null
        });
    } catch (error) {
        console.error('Error checking map access:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateViewingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, meetingLink } = req.body;

        const updateData = { status };
        if (meetingLink) updateData.meetingLink = meetingLink;

        // Automatically grant map access when viewing is confirmed
        if (status === 'confirmed') {
            updateData.mapAccessGranted = true;
            updateData.mapAccessGrantedAt = new Date();
        }

        // Revoke map access when viewing is cancelled
        if (status === 'cancelled') {
            updateData.mapAccessGranted = false;
            updateData.mapAccessGrantedAt = null;
        }

        const viewing = await Viewing.findByIdAndUpdate(id, updateData, { new: true })
            .populate('propertyId', 'title');
        
        if (!viewing) {
            return res.status(404).json({ success: false, message: 'Viewing not found' });
        }

        // Create notification based on status change
        try {
            const notifType = status === 'confirmed' ? 'viewing_confirmed' : 
                             status === 'cancelled' ? 'viewing_cancelled' : 'ticket_updated';
            const title = status === 'confirmed' ? 'Viewing Confirmed!' : 
                         status === 'cancelled' ? 'Viewing Cancelled' : 'Viewing Updated';
            const message = status === 'confirmed' 
                ? `Your viewing for "${viewing.propertyId?.title || 'property'}" has been confirmed.`
                : status === 'cancelled'
                ? `Your viewing for "${viewing.propertyId?.title || 'property'}" has been cancelled.`
                : `Your viewing status has been updated to ${status}.`;
            
            await createNotificationHelper(
                viewing.userId,
                notifType,
                title,
                message,
                { viewingId: viewing._id, status },
                '/dashboard/viewings'
            );
        } catch (notifError) {
            console.error('Failed to create viewing notification:', notifError);
        }

        res.json({ success: true, message: 'Viewing updated successfully', viewing });
    } catch (error) {
        console.error('Error updating viewing:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
