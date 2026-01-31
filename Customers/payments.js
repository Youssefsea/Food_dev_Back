const data = require('../data/data');
const { Readable } = require('stream');
const cloudinary = require('../data/cloudTheImg');

/**
 * @param {number} customerId 
 * @param {number} amount 
 * @param {string} paymentMethod 
 * @param {number} order_id 
 * @param {object} imgPay 
 * @returns {object} 
 */
const processPayment = async (customerId, amount, paymentMethod, order_id, imgPay) => {
   const connection = await data.getConnection();

    try {
        await connection.beginTransaction();
        const [rows] = await connection.query('SELECT * FROM payments WHERE order_id = ?', [order_id]);
        if (rows.length > 0) {
            return { success: false, message: 'Payment already exists for this order', data: rows[0] };
        }

        if (!imgPay || imgPay.length === 0) {
            return { success: false, message: 'Payment proof image is required' };
        }

        if (!['vodafone_cash', 'instapay'].includes(paymentMethod)) {
            return { success: false, message: "Invalid payment method. Use 'vodafone_cash' or 'instapay'" };
        }

       
        const file = Array.isArray(imgPay) ? imgPay[0] : imgPay;

        if(!file||!file.buffer)
        {
            return { success: false, message: 'Invalid payment proof image' };
        }

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "payimg" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            Readable.from(file.buffer).pipe(stream);
        });
        const imgPayUrl = uploadResult.secure_url;


        const [addToPayment] = await connection.query(
            "INSERT INTO payments (order_id, amount, payment_method, payment_proof, status) VALUES (?, ?, ?, ?, 'pending')",
            [order_id, amount, paymentMethod, imgPayUrl]
        );

        const paymentId = addToPayment.insertId;

        await connection.query("UPDATE orders SET payment_id = ? WHERE id = ?", [paymentId, order_id]);
 await connection.commit();
        return {
            success: true,
            message: 'Payment proof uploaded successfully. Waiting for confirmation.',
            data: {
                paymentId,
                order_id,
                amount,
                paymentMethod,
                payment_proof: imgPayUrl,
                status: 'pending'
            }
        };
       

    } catch (err) {
       await connection.rollback();
        console.error("Error processing payment:", err.message);
        return { success: false, message: err.message };
    }
    finally {
        connection.release();
    }
};



const uploadPaymentProof = async (req, res) => {
    const connection = await data.getConnection();
    try {
         
        const customerId = req.user.id;
        const { orderId, payment_method } = req.body;

        const imgpayment=req.files;
        const [orderRows] = await connection.query(
            "SELECT id, status, total_amount FROM orders WHERE id = ? AND user_id = ?",
            [orderId, customerId]
        );

        if (orderRows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        const order = orderRows[0];

       
        if (order.status !== 'pending') {
            return res.status(400).json({ error: "Payment already submitted or order is not in pending status" });
        }

      
        const result = await processPayment(
            customerId,
            order.total_amount,
            payment_method,
            orderId,
            imgpayment
        );

        if (result.success) {
          
            return res.status(201).json(result);
        } else {
        
            return res.status(400).json({ error: result.message });
        }


    } catch (err) {
           
        console.error("Error uploading payment proof:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
    finally {
        connection.release();
    }
};


const confirmPayment = async (req, res) => {
    const connection = await data.getConnection();
    try {
        await connection.beginTransaction();
        const { paymentId } = req.body;

        const [paymentRows] = await connection.query("SELECT * FROM payments WHERE id = ?", [paymentId]);

        if (paymentRows.length === 0) {
            return res.status(404).json({ error: "Payment not found" });
        }


        const payment = paymentRows[0];

        if (payment.status !== 'pending') {
            return res.status(400).json({ error: "Payment already processed" });
        }

        await connection.query("UPDATE payments SET status = 'confirmed' WHERE id = ?", [paymentId]);

        await connection.query("UPDATE orders SET status = 'paid' WHERE id = ?", [payment.order_id]);

        const userID=await connection.query("SELECT user_id FROM orders WHERE id = ?", [payment.order_id]);

        const WalletExit=await connection.query("SELECT * FROM wallets WHERE user_id = ?", [userID[0][0].user_id]);
        if(WalletExit[0].length===0)
        {
            await connection.query("INSERT INTO wallets (user_id, balance) VALUES (?, ?)", [userID[0][0].user_id, payment.amount]);
        }
        else
        {
            await connection.query("UPDATE wallets SET balance = balance + ? WHERE user_id = ?", [payment.amount, userID[0][0].user_id]);
        }

        const [[wallet]] = await connection.query("SELECT balance FROM wallets WHERE user_id=?", [userID[0][0].user_id]);

        await connection.commit();



        return res.status(200).json({
            message: "Payment confirmed successfully",
            orderId: payment.order_id,
            newStatus: 'paid',
            userId: userID[0][0].user_id,
            Wallet: wallet.balance


        });

    } catch (err) {
        await connection.rollback();
        console.error("Error confirming payment:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
    finally {
        connection.release();
    }
};



const rejectPayment = async (req, res) => {
    const connection = await data.getConnection();
    try {
        await connection.beginTransaction();
        const { paymentId } = req.body;

        const [paymentRows] = await connection.query("SELECT * FROM payments WHERE id = ?", [paymentId]);

        if (paymentRows.length === 0) {
            return res.status(404).json({ error: "Payment not found" });
        }

        const payment = paymentRows[0];

        if (payment.status !== 'pending') {
            return res.status(400).json({ error: "Payment already processed" });
        }

        await connection.query("UPDATE payments SET status = 'rejected' WHERE id = ?", [paymentId]);
        await connection.query("UPDATE orders SET payment_id = NULL WHERE id = ?", [payment.order_id]);
        await connection.commit();
        return res.status(200).json({
            message:"Payment rejected",
            reason:"Payment proof was not valid",
            orderId: payment.order_id
        });

    } catch (err) {
        await connection.rollback();
        console.error("Error rejecting payment:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
    finally {
        connection.release();
    }
};



const getPaymentStatus = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { orderId } = req.body;

        const [orderRows] = await data.query(
            `SELECT o.id, o.status as order_status, o.total_amount, 
                    p.id as payment_id, p.status as payment_status, p.payment_method, p.created_at as payment_date
             FROM orders o
             LEFT JOIN payments p ON o.payment_id = p.id
             WHERE o.id = ? AND o.user_id = ?`,
            [orderId, customerId]
        );

        if (orderRows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        const order = orderRows[0];

        return res.status(200).json({
            orderId: order.id,
            totalAmount: order.total_amount,
            orderStatus: order.order_status,
            payment: order.payment_id ? {
                id: order.payment_id,
                status: order.payment_status,
                method: order.payment_method,
                date: order.payment_date
            } : null
        });

    } catch (err) {
        console.error("Error getting payment status:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getPaymentStatusForOrder = async (req, res) => 
{
    try
    {
        const {orderId}=req.body;
        const result=await data.query("SELECT p.status FROM payments p JOIN orders o ON p.id = o.payment_id WHERE o.id = ?", [orderId]);
        if(result[0].length===0)
        {
            return res.status(404).json({error:"No payment found for this order"});
        }
        return res.status(200).json({paymentStatus:result[0][0].status});
    }
    catch(err)
    {
        console.error("Error getting payment status for order:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}


const getPendingPayments = async (req, res) => {
    try {
        const [payments] = await data.query(
            `SELECT p.id as payment_id, p.amount, p.payment_method, p.payment_proof, p.created_at,
                    o.id as order_id, o.location, o.is_reservation, o.reservation_date,
                    u.name as customer_name, u.phone as customer_phone
             FROM payments p
             JOIN orders o ON p.order_id = o.id
             JOIN users u ON o.user_id = u.id
             WHERE p.status = 'pending'
             ORDER BY p.created_at ASC`
        );

        return res.status(200).json({
            count: payments.length,
            pendingPayments: payments
        });

    } catch (err) {
        console.error("Error getting pending payments:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = {
    processPayment,
    uploadPaymentProof,
    confirmPayment,
    rejectPayment,
    getPaymentStatus,
    getPendingPayments,
    getPaymentStatusForOrder
};