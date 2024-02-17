const { ClientService, UserService } = require('../services');
const { ErrorResponse } = require('../utils/common/');
const { StatusCodes } = require('http-status-codes');
const { verifyToken } = require('../utils/common/auth');
const AppError = require('../utils/errors/app-error')

async function checkUserAuth(req, res, next) {
    try {
        const token = req.headers['authorization'].split(" ")[1];
        if (!token) {
            throw new AppError('Missing jwt token', StatusCodes.BAD_REQUEST);
        }
        const response = verifyToken(token);
        const user = await UserService.getUserById(response.id);
        if (!user) {
            throw new AppError('No user found', StatusCodes.NOT_FOUND);
        }
        req.body.user = user;
        next();
    } catch (error) {
        const errorResponse = ErrorResponse(error);
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse)
    }
}

async function checkClientAuth(req, res, next) {
    try {
        const token = req.headers['authorization'].split(" ")[1];
        if (!token) {
            throw new AppError('Missing jwt token', StatusCodes.BAD_REQUEST);
        }
        const response = verifyToken(token);
        const client = await ClientService.getClientById(response.id);
        if (!client) {
            throw new AppError('No user found', StatusCodes.NOT_FOUND);
        }
        req.body.client = client;
        next();
    } catch (error) {
        const errorResponse = ErrorResponse({}, error);
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse)
    }
}

async function checkVerifiedLawyer(req, res, next) {
    try {
        const lawyer = await UserService.getUserByPhoneNumber(req.body.phoneNumber);
        if (!lawyer) throw new AppError("No lawyer found", StatusCodes.NOT_FOUND);
        if (!lawyer.verified) throw new AppError("Please verify first", StatusCodes.FORBIDDEN);
        req.lawyer = lawyer;
        next();
    } catch (error) {
        return res.status(error.statusCode).json(ErrorResponse({}, error));
    }
}

async function checkRegisteredLawyer(req, res, next) {
    try {
        const lawyer = await UserService.getUserByPhoneNumber(req.body.phoneNumber);
        if (!lawyer || !lawyer.registered) throw new AppError("Unauthorized, Please register first", StatusCodes.FORBIDDEN);
        req.lawyer = lawyer;
        next();
    } catch (error) {
        return res.status(error.statusCode).json(ErrorResponse({}, error));
    }
}


module.exports = {
    checkUserAuth,
    checkClientAuth,
    checkVerifiedLawyer,
    checkRegisteredLawyer,
}