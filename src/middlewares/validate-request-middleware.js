const { StatusCodes } = require('http-status-codes');
const Joi = require('joi');

const lawyerRegisterSchema = require('../schema/lawyerRegisterSchema');
const lawyerVerifySchema = require('../schema/lawyerVerifySchema');
const lawyerUpdateSchema = require("../schema/lawyerUpdateSchema");
const clientVerifySchema = require('../schema/clientVerifySchema');
const clientUpdateSchema = require("../schema/clientUpdateSchema");
const clientRegisterSchema = require("../schema/clientRegisterSchema");
const createPaymentSchema = require('../schema/createPaymentSchema');
const AppError = require('../utils/errors/app-error');
const { ErrorResponse } = require('../utils/common');
var jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;



async function validateCreatePaymentRequest(req, res, next) {
    try {
        req.body.request = parseInt(req.body.request);
        req.body.session = parseInt(req.body.session);
        req.body.billingCycle = req.body.billingCycle.toUpperCase();
        req.body.plan = req.body.plan.toUpperCase();
        await createPaymentSchema.validateAsync(req.body);
        next();
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse({}, error));
    }
}

async function validateLawyerUpdateRequest(req, res, next) {
    try {
        await lawyerUpdateSchema.validateAsync(req.body);
        next();
    } catch (error) {
        const errorResponse = ErrorResponse({}, error);
        res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }
}

async function validateClientUpdateRequest(req, res, next) {
    try {
        await clientUpdateSchema.validateAsync(req.body);
        next();
    } catch (error) {
        const errorResponse = ErrorResponse({}, error);
        res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }
}

async function validateClientVerifyRequest(req, res, next) {
    // console.log("asdddddddddddddasdasdasdsadwdwddadad")

    // try {
    //     const token = req.header("auth-token");
    //     if (!token) {
    //         res.status(401).send({ error: "Please authenticate using a valid token" });
    //       }
    //     const data = jwt.verify(token, JWT_SECRET);
    //     if(data.verified){
    //     await clientVerifySchema.validateAsync(req.body);
    //     next();

    // }
      
  
    // } catch (error) {
    //   res.status(401).send({ error: "Please authenticate using a valid token" });
    // }
    
    try {
        if (req.verified) {
            req.verified = req.verified.toLowerCase() === 'true' ? true : false;
        }
        await clientVerifySchema.validateAsync(req.body);
        next()
    } catch (error) {
        const errorResponse = ErrorResponse({}, error);
        res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }
}

async function validateLawyerVerifyRequest(req, res, next) {
    try {
        req.body.phoneNumber = req.body.phoneNumber.toString();
        await lawyerVerifySchema.validateAsync(req.body);
        next();
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse({}, error));
    }
}

async function validateLawyerRegisterRequest(req, res, next) {
    try {
        req.body.barCouncilNo = parseInt(req.body.barCouncilNo);
        req.body.barCouncilYear = parseInt(req.body.barCouncilYear);
        req.body.pincode = parseInt(req.body.pincode);
        req.body.phoneNumber = req.body.phoneNumber.toString();
        if (!req.file?.buffer) throw new AppError("Missing identification attachment");
        if (req.lawyer.registered) throw new AppError("Lawyer already registered");
        await lawyerRegisterSchema.validateAsync(req.body);
        next();
    }
    catch (error) {
        console.log(error)
        res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse({}, error));
    }
}

async function validateClientRegisterRequest(req, res, next) {
    try {
        await clientRegisterSchema.validateAsync(req.body);
        next();
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse({}, error));
    }
}

function validateSignUpRequest(req, res, next) {
    if (!req.body.username) {
        ErrorResponse.message = "Something went wrong  while authenticating";
        ErrorResponse.error = new AppError(["username not found in the incoming request"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }

    if (!req.body.email) {
        ErrorResponse.message = "Something went wrong  while authenticating";
        ErrorResponse.error = new AppError(["email not found in the incoming request"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }

    if (!req.body.password) {
        ErrorResponse.message = "Something went wrong while authenticating";
        ErrorResponse.error = new AppError(["password not found in the incoming request"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }
    next();
}

function validateLoginRequest(req, res, next) {
    if (!req.body.username) {
        ErrorResponse.message = "Something went wrong  while authenticating";
        ErrorResponse.error = new AppError(["username not found in the incoming request"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }

    if (!req.body.password) {
        ErrorResponse.message = "Something went wrong while authenticating";
        ErrorResponse.error = new AppError(["password not found in the incoming request"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }
    next();
}


async function validateAuthRequest(req, res, next) {
    if (!req.headers['authorization']) {
        ErrorResponse.message = "Something went wrong while verifying token";
        ErrorResponse.error = new AppError(["token not found in the incoming request"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }
    next();
}

function validatePostRequest(req, res, next) {
    if (!req.body.description || req.body.description === "") {
        ErrorResponse.message = "Description can't be empty.";
        ErrorResponse.error = new AppError(["Description is not found in the incoming message"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }
    if (!req.body.price_range || req.body.price_range === "") {
        ErrorResponse.message = "Price Range can't be empty.";
        ErrorResponse.error = new AppError(["Price Range is not found in the incoming message"], StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }
    next();
}

function validatePostUpdateRequest(req, res, next) {
    if (!req.body.id && req.body.id === "" && req.query.id === "") {
        ErrorResponse.message = "Post Id cannot be empty";
        ErrorResponse.error = new AppError("Post id not found in the incoming message", StatusCodes.BAD_REQUEST);
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse)
    }
    next();
}


module.exports = {
    validateSignUpRequest,
    validateLoginRequest,
    validateAuthRequest,
    validatePostRequest,
    validatePostUpdateRequest,
    validateLawyerRegisterRequest,
    validateLawyerUpdateRequest,
    validateLawyerVerifyRequest,
    validateClientVerifyRequest,
    validateClientUpdateRequest,
    validateClientRegisterRequest,
    validateCreatePaymentRequest,
}