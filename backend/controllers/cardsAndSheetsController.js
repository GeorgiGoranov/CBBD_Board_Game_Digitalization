
const createCards = (CardModel) => {
    return async (req, res) => {
        try {
            const { category, options, role } = req.body;
            const host = "dflt"; //req.user.id; 

            const cardExists = await CardModel.findOne({ category: category });
            if (cardExists) {
                return res.status(400).json({ message: 'Card with this category already exists!' });
            }

            const newCard = new CardModel({
                category,
                options: {
                    nl: options.nl,
                    de: options.de
                },
                role,
                host,
            });

            await newCard.save();
            res.status(201).json({ message: 'New Card created!', category, options, role, host });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating card' });
        }
    };
};

const getOneCardPerCategory = (CardModel) => {
    return async (req, res) => {
        try {
            const categories = await CardModel.distinct('category');
            const cards = await Promise.all(
                categories.map(async (category) => {
                    const card = await CardModel.findOne({ category }).select('category subcategories').lean();
                    if (!card || !card.subcategories || card.subcategories.length === 0) return null;
                    const randomIndex = Math.floor(Math.random() * card.subcategories.length);
                    const selectedSubcategory = card.subcategories[randomIndex];
                    return {
                        category: card.category,
                        subcategory: selectedSubcategory.name,
                        options: selectedSubcategory.options,
                    };
                })
            );

            const filteredCards = cards.filter(Boolean);
            res.status(200).json(filteredCards);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching cards', error: error.message });
        }
    };
};

module.exports = {
    createCards,
    getOneCardPerCategory
};
