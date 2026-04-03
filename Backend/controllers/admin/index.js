const ordersAdminController = require('./ordersAdminController');
const customersAdminController = require('./customersAdminController');
const productsAdminController = require('./productsAdminController');

module.exports = {
  ...ordersAdminController,
  ...customersAdminController,
  ...productsAdminController
};
