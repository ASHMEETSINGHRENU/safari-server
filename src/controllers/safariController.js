import { Safari } from '../models/Safari.js';
import { Destination } from '../models/Destination.js';
import { regexEscape } from '../utils/search.js';

export const getSafaris = async (req, res, next) => {
  try {
    const { destinationSlug, state, safariType, slot, maxPrice, search } = req.query;
    let query = { isPublished: true };

    if (destinationSlug) {
      query.destinationSlug = destinationSlug;
    }
    if (state) {
      query.state = state;
    }
    if (safariType) {
      query.safariType = safariType;
    }
    if (slot) {
      query.slot = slot;
    }
    if (maxPrice) {
      query.basePrice = { $lte: Number(maxPrice) };
    }
if (search) {
      const term = regexEscape(search);
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { destinationName: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } }
      ];
    }

    const safaris = await Safari.find(query).populate('destination').sort({ basePrice: 1 });
    res.json({ success: true, count: safaris.length, safaris });
  } catch (error) {
    next(error);
  }
};

export const getSafariBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const safari = await Safari.findOne({ slug }).populate('destination');
    if (!safari) {
      return res.status(404).json({ success: false, message: 'Safari package not found.' });
    }
    res.json({ success: true, safari });
  } catch (error) {
    next(error);
  }
};

export const createSafari = async (req, res, next) => {
  try {
    const safari = await Safari.create(req.body);
    res.status(201).json({ success: true, safari });
  } catch (error) {
    next(error);
  }
};

export const updateSafari = async (req, res, next) => {
  try {
    const { id } = req.params;
    const safari = await Safari.findByIdAndUpdate(id, req.body, { new: true });
    if (!safari) return res.status(404).json({ success: false, message: 'Safari not found.' });
    res.json({ success: true, safari });
  } catch (error) {
    next(error);
  }
};

export const deleteSafari = async (req, res, next) => {
  try {
    const { id } = req.params;
    const safari = await Safari.findByIdAndDelete(id);
    if (!safari) return res.status(404).json({ success: false, message: 'Safari not found.' });
    res.json({ success: true, message: 'Safari deleted.' });
  } catch (error) {
    next(error);
  }
};
