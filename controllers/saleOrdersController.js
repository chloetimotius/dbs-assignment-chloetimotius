const { EMPTY_RESULT_ERROR, UNIQUE_VIOLATION_ERROR, DUPLICATE_TABLE_ERROR } = require('../errors');
const saleOrdersModel = require('../models/saleOrders');
const membersModel = require('../models/members');

// Retrieve all sale orders (admin sees all, members see their own)
module.exports.retrieveAll = function (req, res) {
    let memberId = req.user.memberId;

    membersModel
        .isAdmin(memberId)
        .then(function (isAdmin) {
            if (isAdmin) {
                memberId = null;
            }

            return saleOrdersModel.retrieveAll(memberId);
        })
        .then(function (saleOrders) {
            return res.json({ saleOrders: saleOrders });
        })
        .catch(function (error) {
            console.error(error);
            if (error instanceof EMPTY_RESULT_ERROR) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        });
};

// Admin dashboard sales summary with filters
module.exports.getSummary = async function (req, res) {
    try {
        const memberId = req.user.memberId;

        const isAdmin = await membersModel.isAdmin(memberId);
        if (!isAdmin) {
            return res.status(403).json({ error: 'Access denied: Admins only.' });
        }

        const filters = {
            gender: req.query.gender,
            productType: req.query.productType,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            sortBy: req.query.sortBy || 'total_spending',
            minTotalSpending: Number(req.query.minTotalSpending) || 0,
            minMemberTotalSpending: Number(req.query.minMemberTotalSpending) || 0
        };

        console.log('Filters received:', filters);

        const summary = await saleOrdersModel.getSummary(filters);
        res.json({ summary });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve sales summary: ' + err.message });
    }
};
