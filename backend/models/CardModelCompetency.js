const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CompetencyCardSchema = new Schema({
    category: {
        type: String,
        required: true
    },
    subcategories: [
        {
            name: {
                type: String,
                required: true
            },
            options: {
                nl: {
                    type: String,
                    required: true
                },
                de: {
                    type: String,
                    required: true
                }
            }
        }
    ]
});

// Specify the collection name and use the secondary `cbbdConnection`
module.exports = mongoose.model('competency-cards', CompetencyCardSchema);
