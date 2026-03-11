import User from '../models/Usermodel.js';
import Product from '../models/propertymodel.js';
import Viewing from '../models/viewingModel.js';
import Lead from '../models/leadModel.js';
import Appointment from '../models/appointmentModel.js';

/**
 * Get agent dashboard stats
 */
export const getAgentStats = async (req, res) => {
    try {
        const agentId = req.user._id;
        
        // Get listings the agent is associated with
        const listings = await Product.find({ agentId }).lean();
        
        // Get leads for this agent
        const leads = await Lead.find({ agentId }).lean();
        
        // Get viewings scheduled with this agent
        const viewings = await Viewing.find({ agentId }).lean();
        
        // Calculate stats
        const totalListings = listings.length;
        const activeDeals = leads.filter(l => ['Hot', 'Warm'].includes(l.status)).length;
        const closedDeals = leads.filter(l => l.status === 'Converted').length;
        
        // Calculate commission (example: 2.5% of converted deals value)
        const totalCommission = leads
            .filter(l => l.status === 'Converted')
            .reduce((sum, lead) => sum + (lead.budget?.max || 0) * 0.025, 0);
        
        const clientCount = leads.length;
        const viewingsScheduled = viewings.filter(v => v.status === 'Pending' || v.status === 'Confirmed').length;
        
        // Rating (placeholder - could be from reviews)
        const rating = 4.5;
        const reviewCount = Math.floor(clientCount * 0.7);

        res.json({
            success: true,
            stats: {
                totalListings,
                activeDeals,
                closedDeals,
                totalCommission,
                clientCount,
                viewingsScheduled,
                rating,
                reviewCount
            }
        });
    } catch (error) {
        console.error('Error getting agent stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
};

/**
 * Get agent's listings
 */
export const getAgentListings = async (req, res) => {
    try {
        const agentId = req.user._id;
        
        // Get properties where agent is assigned or all properties if admin
        let listings;
        if (req.user.role === 'admin') {
            listings = await Product.find().sort({ createdAt: -1 }).limit(20);
        } else {
            listings = await Product.find({ agentId }).sort({ createdAt: -1 });
        }
        
        res.json({ success: true, listings });
    } catch (error) {
        console.error('Error getting agent listings:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch listings' });
    }
};

/**
 * Get agent's leads
 */
export const getAgentLeads = async (req, res) => {
    try {
        const agentId = req.user._id;
        const { status, limit = 50 } = req.query;
        
        const query = { agentId };
        if (status) query.status = status;
        
        const leads = await Lead.find(query)
            .populate('propertyId', 'title image location')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
        
        res.json({ success: true, leads });
    } catch (error) {
        console.error('Error getting agent leads:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch leads' });
    }
};

/**
 * Create a new lead
 */
export const createLead = async (req, res) => {
    try {
        const agentId = req.user._id;
        const leadData = {
            ...req.body,
            agentId
        };
        
        const lead = new Lead(leadData);
        await lead.save();
        
        res.status(201).json({ success: true, lead, message: 'Lead created successfully' });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ success: false, message: 'Failed to create lead' });
    }
};

/**
 * Update lead status
 */
export const updateLeadStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, nextFollowUp } = req.body;
        const agentId = req.user._id;
        
        const lead = await Lead.findOneAndUpdate(
            { _id: id, agentId },
            { 
                status, 
                notes: notes || undefined,
                nextFollowUp: nextFollowUp || undefined,
                lastContactDate: new Date()
            },
            { new: true }
        );
        
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }
        
        res.json({ success: true, lead, message: `Lead status updated to ${status}` });
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ success: false, message: 'Failed to update lead' });
    }
};

/**
 * Delete a lead
 */
export const deleteLead = async (req, res) => {
    try {
        const { id } = req.params;
        const agentId = req.user._id;
        
        const lead = await Lead.findOneAndDelete({ _id: id, agentId });
        
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }
        
        res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ success: false, message: 'Failed to delete lead' });
    }
};

/**
 * Get agent's viewings
 */
export const getAgentViewings = async (req, res) => {
    try {
        const agentId = req.user._id;
        
        const viewings = await Viewing.find({ agentId })
            .populate('propertyId', 'title image location price')
            .populate('userId', 'name email phone')
            .sort({ date: -1 });
        
        res.json({ success: true, viewings });
    } catch (error) {
        console.error('Error getting agent viewings:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch viewings' });
    }
};

/**
 * Get agent clients (unique users who have interacted)
 */
export const getAgentClients = async (req, res) => {
    try {
        const agentId = req.user._id;
        
        // Get unique user IDs from leads
        const leads = await Lead.find({ agentId })
            .select('name email phone interest status createdAt')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, clients: leads });
    } catch (error) {
        console.error('Error getting agent clients:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch clients' });
    }
};
