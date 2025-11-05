/*
  controllers/productController.js - CRUD for products
*/

import httpStatus from 'http-status';
import Joi from 'joi';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const productSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow(''),
  price: Joi.number().min(0).required(),
  images: Joi.array().items(Joi.string().uri()).default([]),
  category: Joi.string().allow(''),
  brand: Joi.string().allow(''),
  countInStock: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
});

export const createProduct = asyncHandler(async (req, res) => {
  const { error, value } = productSchema.validate(req.body);
  if (error) return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  const product = await Product.create(value);
  res.status(httpStatus.CREATED).json(product);
});

export const listProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20, category } = req.query;
  const query = {};
  if (q) query.name = { $regex: q, $options: 'i' };
  if (category) query.category = category;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(httpStatus.OK).json({ total, page: Number(page), limit: Number(limit), products });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(httpStatus.NOT_FOUND).json({ message: 'Product not found' });
  res.status(httpStatus.OK).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { error, value } = productSchema.fork(['name', 'price'], (s) => s.optional()).validate(req.body);
  if (error) return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });

  const product = await Product.findByIdAndUpdate(req.params.id, value, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(httpStatus.NOT_FOUND).json({ message: 'Product not found' });
  res.status(httpStatus.OK).json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(httpStatus.NOT_FOUND).json({ message: 'Product not found' });
  res.status(httpStatus.NO_CONTENT).send();
});
