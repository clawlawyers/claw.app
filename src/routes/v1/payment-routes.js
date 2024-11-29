    const express = require('express');
const { authMiddleware, validateRequestMiddleware } = require('../../middlewares');
const { CashfreeController } = require('../../controllers');
const { createHmac } = require("crypto");
const { CASHFREE_CLIENT_SECRET } = require('../../config/server-config');
const { ErrorResponse } = require('../../utils/common');
const { PaymentService, OrderService, GptServices } = require('../../services');
const { paymentStatus } = require('../../utils/common/constants');
const router = express.Router();

router.post(
    "/create-payment-order",
    validateRequestMiddleware.validateCreatePaymentRequest,
    authMiddleware.checkClientAuth,
    CashfreeController.createOrder
);

function verify(req) {
    const body = req.headers["x-webhook-timestamp"] + req.rawBody;
    let genSignature = createHmac('sha256', CASHFREE_CLIENT_SECRET).update(body).digest("base64");
    return genSignature
}

router.post('/webhook', (req, res) => {
    try {
        const genSignature = verify(req);
        if (genSignature !== req.headers["x-webhook-signature"]) throw new Error("Invalid signature");
        const { payment, order } = req.body.data;
        switch (payment.payment_status) {
            case "SUCCESS":
                successEvent(order.order_id);
                return
            case "FAILED":
                failedEvent(order.order_id);
                return;
            default:
                console.log("Unkown event recieved", payment);
        }

        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.status(400).json(ErrorResponse({}, error));
    }

})

async function successEvent(orderId) {
    try {
        // update order
        const placedOrder = await OrderService.updateOrder(orderId, { paymentStatus: paymentStatus.SUCCESS });
        // update the plan for user
        console.log(placedOrder.user.toString(), placedOrder.plan)
        await GptServices.updateUserPlan(placedOrder.user.toString(), placedOrder.plan);
    } catch (error) {
        console.error(error);
    }
}
async function failedEvent(orderId) {
    try {
        // update order
        const placedOrder = await OrderService.updateOrder(orderId, { paymentStatus: paymentStatus.FAILED });
        // update the plan for user
        console.log(placedOrder.userId.toString(), placedOrder.plan)
    } catch (error) {
        console.error(error);
    }
}

module.exports = router;