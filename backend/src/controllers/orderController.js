/*
  controllers/orderController.js - CRUD for orders
*/

import httpStatus from 'http-status';
import Joi from 'joi';
import Order from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const orderSchema = Joi.object({
  orderItems: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required(),
        name: Joi.string().required(),
        qty: Joi.number().integer().min(1).required(),
        price: Joi.number().min(0).required(),
        image: Joi.string().allow(''),
      })
    )
    .min(1)
    .required(),
  shippingAddress: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
  paymentMethod: Joi.string().required(),
  itemsPrice: Joi.number().min(0).required(),
  taxPrice: Joi.number().min(0).required(),
  shippingPrice: Joi.number().min(0).required(),
  totalPrice: Joi.number().min(0).required(),
});

export const createOrder = asyncHandler(async (req, res) => {
  const { error, value } = orderSchema.validate(req.body);
  if (error) return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });

  const order = await Order.create({ ...value, user: req.user._id });
  res.status(httpStatus.CREATED).json(order);
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(httpStatus.OK).json(orders);
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(httpStatus.NOT_FOUND).json({ message: 'Order not found' });
  // Only owner or admin can access
  if (String(order.user._id) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(httpStatus.FORBIDDEN).json({ message: 'Forbidden' });
  }
  res.status(httpStatus.OK).json(order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, isPaid, isDelivered } = req.body;
  const updates = {};
  if (status) updates.status = status;
  if (isPaid !== undefined) updates.isPaid = !!isPaid;
  if (isDelivered !== undefined) updates.isDelivered = !!isDelivered;
  if (updates.isPaid) updates.paidAt = new Date();
  if (updates.isDelivered) updates.deliveredAt = new Date();

  const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!order) return res.status(httpStatus.NOT_FOUND).json({ message: 'Order not found' });
  res.status(httpStatus.OK).json(order);
});

export const listAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = {};
  if (status) query.status = status;

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(httpStatus.OK).json({ total, page: Number(page), limit: Number(limit), orders });
});
