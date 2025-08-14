const { query } = require('../database');
const { EMPTY_RESULT_ERROR, SQL_ERROR_CODE, UNIQUE_VIOLATION_ERROR } = require('../errors');

module.exports.retrieveAll = function retrieveAll(memberId) {
    let params = [];
    let sql = `SELECT * FROM sale_order_item s JOIN sale_order o ON s.sale_order_id=o.id JOIN product p ON s.product_id=p.id JOIN member m ON o.member_id=m.id`;
    if (memberId) {
        sql += ` WHERE o.member_id = $1`
        params.push(memberId);
    }
    return query(sql, params).then(function (result) {
        const rows = result.rows;

        if (rows.length === 0) {
            throw new EMPTY_RESULT_ERROR(`Sale Order not found!`);
        }

        return rows;
    });
};

module.exports.getSummary = async function getSummary({
  gender,
  productType,
  startDate,
  endDate,
  sortBy,
  minTotalSpending,
  minMemberTotalSpending
}) {
const sql = `
  SELECT * FROM get_sale_order_summary(
    $1::varchar, 
    $2::varchar, 
    $3::date, 
    $4::date, 
    $5::varchar, 
    $6::numeric, 
    $7::numeric
  )`;

  const values = [
    gender,
    productType,
    startDate,
    endDate,
    sortBy,
    minTotalSpending,
    minMemberTotalSpending
  ];

  const result = await query(sql, values);
  return result.rows;
};

module.exports.placeOrder = async function (memberId) {
    try {
        console.log("Calling stored procedure with memberId:", memberId);
        await query(`CALL place_orders($1)`, [memberId]);
        console.log("Stored procedure executed successfully");
    } catch (err) {
        console.error('Error placing order:', err);
        throw err;
    }
};

