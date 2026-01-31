const data=require('../data/data');


const lookForNearRestaurants = async (req, res) => {
  try {
    const { lat, lng } = req.body;

   if(lat == null || lng == null){
      return res.status(400).json({ error: "lat & lng required" });
    }

const userPoint = `POINT(${lng} ${lat})`;

const [rows] = await data.query(
  `SELECT id AS area_id, restaurant_id
   FROM restaurant_delivery_areas
   WHERE ST_Intersects(
     delivery_area,
     ST_GeomFromText(?, 4326)
   )`,
  [userPoint]
);


  

    if (rows.length === 0) {
      return res.status(400).json({ message: "No nearby restaurants found" });
    }

    const restaurantIds = rows.map(r => r.restaurant_id);
if (!restaurantIds.length) {
  return res.status(400).json({ error: "No nearby restaurants found" });
}

    const [restaurants] = await data.query(
      `SELECT id, description, location
       FROM restaurant_profiles
       WHERE id IN (${restaurantIds.map(() => '?').join(',')})`,
      restaurantIds
    );
    

    const result = rows.map(area => {
      const info = restaurants.find(r => r.id === area.restaurant_id);
      return {
           id: area.restaurant_id, 
        area_id: area.area_id,
        restaurant_id: area.restaurant_id,
        description: info?.description,
        location: info?.location
      };
    });

    return res.status(200).json({
      count: result.length,
      nearby_restaurants: result
    });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const lookforAllRestaurants=async(req,res)=>
{
try
{
// const [restaurants]=await data.query("SELECT id,description,location,can_reserve,can_deliver FROM restaurant_profiles inner join restaurant_delivery_areas ON restaurant_profiles.id = restaurant_delivery_areas.restaurant_id WHERE is_open=1");

const [restaurants] = await data.query(`
 SELECT DISTINCT
  rp.id,
  rp.user_id,
  u.name AS restaurant_name,   
  rp.description,
  rp.location,
  rda.can_deliver,
  rda.can_reserve
FROM restaurant_profiles rp
INNER JOIN restaurant_delivery_areas rda
  ON rp.id = rda.restaurant_id
INNER JOIN users u
  ON rp.user_id = u.id
WHERE rp.is_open = 1

`);


if(restaurants.length===0)
{
    return res.status(404).json({error:"No restaurants found"});
}
return res.status(200).json({restaurants});
}

catch(err)
{
    console.error("Error:",err);
    return res.status(500).json({error:"Internal server error"});
}
};

const restaurantsWhoCanResiveOrder=async(req,res)=>
{
try
{

const [restaurantIds]=await data.query('SELECT restaurant_id FROM restaurant_delivery_areas WHERE can_reserve=1');



if(restaurantIds.length>0)
{
const ids=restaurantIds.map(r=>r.restaurant_id);
if (!ids.length) {
  return res.status(400).json({ error: "No restaurants found in cart" });
}


const [restaurants]=await data.query(`SELECT  description, location FROM restaurant_profiles WHERE id IN (${ids.map(()=>'?').join(',')})`, ids);

return res.status(200).json({ restaurants });
}
else
{
return res.status(404).json({error:"No restaurant available to receive orders"});
}
}catch(err)
{
    console.error("Error:",err);
    return res.status(500).json({error:"Internal server error"});
}

}



const addDishToCart=async(req,res)=>
{
try{

const customerId=req.user.id;
const {dishId,quantity}=req.body;

const chekDishavailability=await data.query("SELECT is_available FROM dishes WHERE id=?", [dishId]);
if(chekDishavailability[0].length===0)
{
    return res.status(400).json({error:"Dish not found"});
}
if(!chekDishavailability[0][0].is_available)
{
    return res.status(400).json({error:"Dish is not available"});
}

const [exitCart]=await data.query("SELECT id FROM carts WHERE user_id=?", [customerId]);
if(exitCart.length===0)
{
    const [newCart]=await data.query("INSERT INTO carts (user_id) VALUES (?)",[customerId]);
    const cartId=newCart.insertId;
    await data.query("INSERT INTO cart_items (cart_id,dish_id,quantity) VALUES (?,?,?)",[cartId,dishId,quantity]);
    console.log("New cart created with ID:", cartId);
    return res.status(201).json({message:"Dish added to cart successfully"});
}

else if(exitCart.length>0)
{
    await data.query('UPDATE carts SET updated_at= CURRENT_TIMESTAMP WHERE id=?',[exitCart[0].id]);
    const [exitItem]=await data.query("SELECT id,quantity FROM cart_items WHERE cart_id=? AND dish_id=?", [exitCart[0].id,dishId]);
if(exitItem.length===0)
{
    await data.query("INSERT INTO cart_items (cart_id,dish_id,quantity) VALUES (?,?,?)",[exitCart[0].id,dishId,quantity]);
    return res.status(201).json({message:"Dish added to cart successfully"});

}

else if(exitItem.length>0)
{
    const newQuantity=exitItem[0].quantity+quantity;
    await data.query("UPDATE cart_items SET quantity=? WHERE id=?", [newQuantity,exitItem[0].id]);
    return res.status(200).json({message:"Dish quantity updated in cart successfully"});
}



}

}catch(err)
{
    console.error("Error:",err);
    return res.status(500).json({error:"Internal server error"});
}

};


const deleteDishFromCart=async(req,res)=>
{
try
{

    const customerId=req.user.id;
    const {dishId}=req.body;

    const [exitCart]=await data.query("SELECT id FROM carts WHERE user_id=?", [customerId]);
    if(exitCart.length===0)
    {
        return res.status(400).json({error:"Cart not found"});
    }

    const [exitItem]=await data.query("SELECT id FROM cart_items WHERE cart_id=? AND dish_id=?", [exitCart[0].id,dishId]);
    if(exitItem.length===0)
    {
        return res.status(400).json({error:"Dish not found in cart"});
    }

    await data.query("DELETE FROM cart_items WHERE id=?", [exitItem[0].id]);
    return res.status(200).json({message:"Dish removed from cart successfully"});

}catch(err)
{
    console.error("Error:",err);
    return res.status(500).json({error:"Internal server error"});


}


};


const getCartDetails=async(req,res)=>
{
try
{

   const customerId=req.user.id;

   const [exitCart]=await data.query("SELECT id FROM carts WHERE user_id=?", [customerId]);
   if(exitCart.length===0)
   {
       return res.status(400).json({error:"Cart not found"});
   }

   const [cartItems]=await data.query("SELECT dish_id, quantity FROM cart_items WHERE cart_id=?", [exitCart[0].id]);
   if(cartItems.length===0){
 return res.status(200).json({cartItems:[]});
}

const dishIds=cartItems.map(item=>item.dish_id);
if (!dishIds.length) {
  return res.status(400).json({ error: "No dishes found in cart" });
}


const [dishes]=await data.query(`SELECT id, name, description, price FROM dishes WHERE id IN (${dishIds.map(()=>'?').join(',')})`, dishIds);

const detailedCartItems=cartItems.map(item=>{
    const dish=dishes.find(d=>d.id===item.dish_id);
    return {
        dishId:item.dish_id,
        quantity:item.quantity,
        name:dish.name,
        description:dish.description,
        price:dish.price
    };
});

   return res.status(200).json({cartItems:detailedCartItems});

}catch(err)
{
    console.error("Error:",err);
    return res.status(500).json({error:"Internal server error"});

}
};






const makeOrder = async (req, res) => {
  const connection = await data.getConnection();

  try {
    await connection.beginTransaction();

    const customerId = req.user.id;
    const { is_reservation, reservation_date, location, lat, lng } = req.body;
const imgPay=req.files;
    const [cartRows] = await connection.query("SELECT id FROM carts WHERE user_id=?", [customerId]);

    if (cartRows.length === 0)
      return res.status(400).json({ error: "Cart not found" });

    const cartId = cartRows[0].id;
    const [cartItems] = await connection.query(
      `SELECT ci.dish_id, ci.quantity, d.price, d.restaurant_id, r.location as restaurant_location
       FROM cart_items ci
       JOIN dishes d ON ci.dish_id = d.id
       JOIN restaurant_profiles r ON d.restaurant_id = r.id
       WHERE ci.cart_id=?`,
      [cartId]
    );

    if (cartItems.length === 0)
      return res.status(400).json({ error: "Cart is empty" });

    const groupOfResCartDishes = {};
    for (const item of cartItems) {
      if (!groupOfResCartDishes[item.restaurant_id]) {
        groupOfResCartDishes[item.restaurant_id] = [];
      }
      groupOfResCartDishes[item.restaurant_id].push(item);
    }

 

    const restaurantCanResv = await data.query('SELECT restaurant_id FROM restaurant_delivery_areas WHERE can_reserve=1');
    if (restaurantCanResv[0].length === 0 && is_reservation) {
      throw new Error("No restaurant available to receive reservations");
    }

  const createdOrders = [];
const failedOrders = [];

for (const restaurantId of Object.keys(groupOfResCartDishes)) {

  try {

    const [resRows] = await connection.query(
      "SELECT is_open, location,allowed_radius_km, delivery_fees FROM restaurant_profiles WHERE id=?",
      [restaurantId]
    );

    if (resRows.length === 0 || !resRows[0].is_open) {
      failedOrders.push({
        restaurantId,
        reason: "Restaurant is closed"
      });
      continue; 
    }

    const deliveryareas = await data.query(
      "SELECT delivery_area FROM restaurant_delivery_areas WHERE restaurant_id=?",
      [restaurantId]
    );

    if (deliveryareas[0].length === 0) {
      failedOrders.push({
        restaurantId,
        reason: "Restaurant has no delivery areas defined"
      });
      continue;
    }

    const pointsNested = deliveryareas[0][0].delivery_area;
const points = pointsNested[0]; 
let sumLat = 0, sumLng = 0;

points.forEach(p => {
  sumLng += p.x; 
  sumLat += p.y; 
});

const lngOfRes = sumLng / points.length;
const latOfRes = sumLat / points.length;

console.log(`Points for restaurant ${restaurantId}:`, points);
console.log(`Sum of lng: ${sumLng}, Sum of lat: ${sumLat}`);
console.log(`Restaurant ${restaurantId} center point: (${latOfRes}, ${lngOfRes})`);


    let totalAmount = 0;
    groupOfResCartDishes[restaurantId].forEach(item => {
      totalAmount += item.price * item.quantity;
    });

    let deliveryFee = 0;
    const allowedRadius = resRows[0].allowed_radius_km;
    const delivery_fees = resRows[0].delivery_fees;

    const [distanceRows] = await connection.query(
      `SELECT ST_Distance_Sphere(POINT(?, ?), POINT(?, ?)) AS distance`,
      [lng, lat, lngOfRes, latOfRes]
    );

    const distanceInKm = distanceRows[0].distance / 1000;

    if (distanceInKm > allowedRadius) {
      failedOrders.push({
        restaurantId,
        reason: "Delivery location is outside allowed radius",
        allowedRadius,
        distanceInKm
      });
      continue;
    }

    deliveryFee = parseFloat((delivery_fees * distanceInKm).toFixed(2));
    totalAmount += deliveryFee;

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, restaurant_id, is_reservation, reservation_date, location, total_amount, delivery_fee, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [customerId, restaurantId, is_reservation || false, reservation_date || null, location, totalAmount, deliveryFee]
    );

    const orderId = orderResult.insertId;

    for (const item of groupOfResCartDishes[restaurantId]) {
      await connection.query(
        `INSERT INTO order_items (order_id, dish_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [orderId, item.dish_id, item.quantity, item.price]
      );
    }

    createdOrders.push({
      orderId,
      restaurantId,
      totalAmount,
      deliveryFee
    });

  } catch (err) {

    failedOrders.push({
      restaurantId,
      reason: err.message
    });

    continue;
  }
}


    await connection.query("DELETE FROM cart_items WHERE cart_id=?", [cartId]);

    if (createdOrders.length === 0) {
  await connection.rollback();
  return res.status(400).json({
    error: "No orders created",
    failedOrders
  });
}


    await connection.commit();

  return res.status(201).json({
  message: "Order processing completed",
  createdOrders,
  failedOrders
});
    
  } catch (err) {
    await connection.rollback();
    console.error("Error:", err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};






module.exports={addDishToCart,deleteDishFromCart,getCartDetails,lookForNearRestaurants,restaurantsWhoCanResiveOrder,makeOrder,lookforAllRestaurants};