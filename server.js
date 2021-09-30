/*********************************************************************************
 * WEB422 – Assignment 1
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: Tim Lin Student ID: 105586192 Date: 2021-09-17
 *
 * Github Link: https://github.com/Crayon826/ass2
 *
 * Heroku Link: https://web422-test2.herokuapp.com/
 *
 ********************************************************************************/

 const express = require("express");
 var cors = require("cors");
 const app = express();
 const HTTP_PORT = process.env.PORT || 8080;
 const RestaurantDB = require("./modules/restaurantDB.js");
 const db = new RestaurantDB();
 const dotenv = require("dotenv").config();
 const { query, validationResult } = require("express-validator");
 
 const mongoLogin = process.env.MONGODB_CONN_STRING;
 
 const connect = db
   .initialize(mongoLogin)
   .then(() => {
     app.listen(HTTP_PORT, () => {
       console.log(`server listening on: ${HTTP_PORT}`);
     });
   })
   .catch((err) => {
     console.log(err);
   });

app.use(express.json());
app.use(cors());
app.get('/', async (req, res) => {
  res.json({ message: 'API Listening' });
});

app.post("/api/restaurants", (req, res) => {
  {
    db.addNewRestaurant(req.body)
      .then((data) => {
        console.log(data);
        res.status(201).json({
          message: "restaurant is inserted successfully",
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "restaurant is not inserted successfully",
        });
      });
  }
});

app.get(
  "/api/restaurants",
  [ query(["page", "perPage"]).isInt({ min: 1 }),
    query(["page", "perPage"]).isString(),
  ],
  async (req, res) => {
    {
      const page = req.query.page;
      const perPage = req.query.perPage;
      const borough = req.query.borough;

      if (page != undefined || perPage != undefined) {
        res.json(await db.getAllRestaurants(page, perPage, borough));
      } else {
        res.status(500).json({
          message: "insert valid params of page, perPage and borough",
        });
      }
    }
  }
);

app.get("/api/restaurants/:id", (req, res) => {
  db.getRestaurantById(req.params.id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).json({
        message: "no restaurant data found with id by" + req.params.id,
      });
    });
});

app.put("/api/restaurants/:id", (req, res) => {
  db.updateRestaurantById(req.body, req.params.id)
    .then((data) => {
      res.status(201).json({
        message: "data is successfully updated",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "no restaurant data found with id by" + req.params.id,
      });
    });
});

app.delete("/api/restaurants/:id", (req, res) => {
  {
    db.deleteRestaurantById(req.params.id)
      .then((data) => {
        res.status(201).json({
          message: "delete successfully",
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "delete unsuccessfully",
        });
      });
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.json({
    code: 500,
    message: 'Internal server error',
  });
});
