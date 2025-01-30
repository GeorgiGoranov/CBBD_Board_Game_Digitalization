
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

const getOneCardPerCategory = (CardModel, RoundModel) => {
    return async (req, res) => {
        try {
            // 1) Grab roomId from query (or from req.body if you prefer)
            const { roomId } = req.params;

            console.log(roomId)
            if (!roomId) {
                return res.status(400).json({ message: 'roomId is required' });
            }

            // 2) Find the round doc to see which subcategories are already used
            const round = await RoundModel.findOne({ roomId });
            const usedSet = new Set();
            // This will store something like "category|subcategoryName"

            if (round && round.cards && round.cards.length > 0) {
                for (const c of round.cards) {
                    const cat = c.card.category;
                    const subcat = c.card.subcategory;
                    usedSet.add(`${cat}||${subcat}`);
                }
            }

            // 3) Fetch all categories from the CardModel
            //    We'll do a normal find (or .find({}) to get everything)
            //    Then remove subcategories that were used
            const allCards = await CardModel.find({}).lean();

            // allCards is an array of documents, each doc looks like:
            // {
            //   category: "...",
            //   subcategories: [
            //     {
            //       name: "...",
            //       options: { nl: "...", de: "..." }
            //     },
            //     ...
            //   ]
            // }

            // 4) Filter out subcategories we already used
            //    Build an array of possible picks of the form:
            //    {
            //       category: 'foo',
            //       subcategory: subcatDoc,
            //    }
            const possiblePicks = [];
            for (const doc of allCards) {
                const { category, subcategories } = doc;

                // remove subcategories that are used
                const filteredSubcats = subcategories.filter(sc => {
                    const uniqueKey = `${category}||${sc.name}`;
                    return !usedSet.has(uniqueKey);
                });

                // for each still-available subcategory, push a "pick" object
                filteredSubcats.forEach(sc => {
                    possiblePicks.push({
                        category,
                        subcategory: sc.name,
                        options: sc.options,
                    });
                });
            }

            // 5) If no possible subcategories left, return 404 or similar
            if (possiblePicks.length === 0) {
                return res.status(404).json({ message: 'No more available subcategories left' });
            }

            // 6) Randomly pick from possiblePicks
            const randomIndex = Math.floor(Math.random() * possiblePicks.length);
            const randomPick = possiblePicks[randomIndex];

            // 7) Send it back
            return res.status(200).json({
                category: randomPick.category,
                subcategory: randomPick.subcategory,
                options: randomPick.options,
            });
        } catch (error) {
            console.error('Error fetching random card', error);
            res.status(500).json({ message: 'Error fetching random card', error: error.message });
        }
    };
};

const getAllCategories = (models) => {
    return async (req, res) => {
        try {
            // Use Promise.all to fetch categories from all models concurrently
            const categoryResults = await Promise.all(
                models.map(model => model.distinct('category'))
            );

            // Flatten and remove duplicates
            const uniqueCategories = [...new Set(categoryResults.flat())].map(category => ({ category }));

            // Send the combined list of categories in the response
            res.status(200).json(uniqueCategories);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching categories', error: error.message });
        }
    };
};

const getAllCards = (models) => {
    return async (req, res) => {
        try {
            // Fetch categories and subcategories
            const categoryResults = await Promise.all(
                models.map(model => model.find({}, { _id: 0, category: 1, subcategories: 1 }))
            );

            // Combine results from all models
            const combinedCategories = categoryResults.flat();

            // Send the structured categories and subcategories in the response
            res.status(200).json(combinedCategories);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching cards', error: error.message });
        }
    };
};

const getAllDefaultProfiles = (model) => {
    return async (req, res) => {
        try {
            // Fetch all documents from the provided model
            const profiles = await model.find();

            // Send the data as a response
            res.status(200).json(profiles);
        } catch (error) {
            console.error("Error fetching profiles:", error);

            // Send an error response
            res.status(500).json({ message: "Failed to fetch profiles", error });
        }
    }
}


module.exports = {
    createCards,
    getOneCardPerCategory,
    getAllCategories,
    getAllCards,
    getAllDefaultProfiles
};
