const express=require('express');
const app=express();
app.use(express.json());
const router=express.Router();
const auth=require('./Customers/authForCustomers');
const middelware = require('./middelware/vaildJwt');
const authForRestaurants=require('./restaurantServes/authForRestaurant');
const dishes=require('./restaurantServes/Dishes');
const orders=require('./Customers/orders');
const payments=require('./Customers/payments');
const upload=require('./middelware/muilter');

router.post('/LogforAdmin', auth.loginForAdmin);

router.post('/customer/signup', auth.signupForCustomer);
router.post('/customer/login', auth.loginForCustomer);
router.get('/customer/profile', middelware.sureToken,middelware.verifyRoleForCustomer, auth.getProfile);
router.put('/customer/change-info', middelware.sureToken,middelware.verifyRoleForCustomer, auth.changeUserInfoForCustomer);

router.post('/customer/add-dish-to-cart', middelware.sureToken,middelware.verifyRoleForCustomer, orders.addDishToCart);
router.delete('/customer/remove-dish-from-cart', middelware.sureToken,middelware.verifyRoleForCustomer, orders.deleteDishFromCart);
router.get('/customer/view-cart', middelware.sureToken,middelware.verifyRoleForCustomer, orders.getCartDetails);
router.post('/customer/nearest-restaurants', middelware.sureToken,middelware.verifyRoleForCustomer, orders.lookForNearRestaurants);
router.get('/customer/can-restaurant-receive-order', middelware.sureToken,middelware.verifyRoleForCustomer, orders.restaurantsWhoCanResiveOrder);
router.post('/customer/place-order', middelware.sureToken,middelware.verifyRoleForCustomer, orders.makeOrder);


router.post('/customer/upload-payment-proof', middelware.sureToken, middelware.verifyRoleForCustomer, upload.array('images', 1), payments.uploadPaymentProof);
router.post('/customer/payment-status', middelware.sureToken, middelware.verifyRoleForCustomer, payments.getPaymentStatus);

router.post('/restaurant/signup', authForRestaurants.AddInfoRestaurant);
router.post('/restaurant/login', authForRestaurants.loginForRestaurant);
router.post('/restaurant/add-dish', middelware.sureToken,middelware.verifyRoleForRestaurant, upload.array('images', 5), dishes.addDishesForRestaurant);
router.get('/restaurant/profile', middelware.sureToken,middelware.verifyRoleForRestaurant, authForRestaurants.restaurantProfile);
router.put('/restaurant/change-info', middelware.sureToken,middelware.verifyRoleForRestaurant, authForRestaurants.changeResturantinfo);
router.put('/restaurant/change-dish', middelware.sureToken,middelware.verifyRoleForRestaurant, dishes.changeResturantDish);
router.put('/restaurant/change-dish-availability', middelware.sureToken,middelware.verifyRoleForRestaurant, dishes.changeDishAvailability);
router.get('/restaurant/is-open', middelware.sureToken,middelware.verifyRoleForRestaurant, authForRestaurants.openOrCloseRestaurant);
router.delete('/restaurant/delete-dish', middelware.sureToken,middelware.verifyRoleForRestaurant, dishes.delelteDish);
router.put('/restaurant/change-delivery-fee', middelware.sureToken,middelware.verifyRoleForRestaurant, authForRestaurants.changeDeliveryFee);

// Dashboard routes
router.get('/restaurant/dashboard', middelware.sureToken, middelware.verifyRoleForRestaurant, authForRestaurants.getDashboardStats);
router.get('/restaurant/orders', middelware.sureToken, middelware.verifyRoleForRestaurant, authForRestaurants.getRestaurantOrders);
router.post('/restaurant/order-status', middelware.sureToken, middelware.verifyRoleForRestaurant, authForRestaurants.updateOrderStatus);
router.post('/restaurant/payment-status', middelware.sureToken,middelware.verifyRoleForRestaurant, payments.getPaymentStatusForOrder);

router.post('/admin/confirmPayment', middelware.sureToken,middelware.verifyRoleForAdmin, payments.confirmPayment);

router.get('/restaurant/dishes', dishes.getAllResDishes);

router.get('/restaurant/all', orders.lookforAllRestaurants);
router.post('/restaurant/all-dishes-for-restaurantV',middelware.sureToken,middelware.verifyRoleForRestaurant, dishes.getAllDishesForRestaurantVendor);
router.post('/restaurant/all-dishes-for-restaurantE', dishes.getAllDishesForRestaurantExplore);


module.exports = router;