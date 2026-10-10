import { Destination } from '../models/Destination.js';
import { regexEscape } from '../utils/search.js';

export const getDestinations = async (req, res, next) => {
  try {
    const { state, search, availability, limit } = req.query;
    let query = { isPublished: true };

    if (state) {
      query.state = state === 'mp' || state === 'madhya-pradesh' ? 'Madhya Pradesh' : 
                    state === 'mh' || state === 'maharashtra' ? 'Maharashtra' : state;
    }

    if (availability) {
      query.availability = availability;
    }

if (search) {
      const term = regexEscape(search);
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { shortDesc: { $regex: term, $options: 'i' } },
        { tagline: { $regex: term, $options: 'i' } },
        { wildlifeHighlights: { $regex: term, $options: 'i' } }
      ];
    }

    let q = Destination.find(query).sort({ state: 1, name: 1 });
    if (limit) q = q.limit(parseInt(limit));

    const destinations = await q;
    res.json({ success: true, count: destinations.length, destinations });
  } catch (error) {
    next(error);
  }
};

// Admin view: every reserve, published or hidden, so the toggle can be flipped back.
export const getDestinationsAdmin = async (req, res, next) => {
  try {
    const destinations = await Destination.find().sort({ state: 1, name: 1 });
    res.json({ success: true, count: destinations.length, destinations });
  } catch (error) {
    next(error);
  }
};

export const getDestinationBySlug = async (req, res, next) => {
  try {
const { slug } = req.params;
    const destination = await Destination.findOne({ slug: slug.toLowerCase(), isPublished: true });
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination reserve not found.' });
    }
    res.json({ success: true, destination });
  } catch (error) {
    next(error);
  }
};

export const createDestination = async (req, res, next) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json({ success: true, destination });
  } catch (error) {
    next(error);
  }
};

export const updateDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const destination = await Destination.findByIdAndUpdate(id, req.body, { new: true });
    if (!destination) return res.status(404).json({ success: false, message: 'Destination not found.' });
    res.json({ success: true, destination });
  } catch (error) {
    next(error);
  }
};

export const deleteDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const destination = await Destination.findByIdAndDelete(id);
    if (!destination) return res.status(404).json({ success: false, message: 'Destination not found.' });
    res.json({ success: true, message: 'Destination removed successfully.' });
  } catch (error) {
    next(error);
  }
};
