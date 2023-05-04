// import user model
const { User } = require('../models');

// import sign token function from auth
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        // Your query resolvers here
        user: async (parent, { userId, username }, { user }) => {
            if (!userId && !username && user) {
              userId = user._id;
            }
      
            if (!userId && !username) {
              throw new Error('Please provide either an ID or a username');
            }
      
            const foundUser = await User.findOne({
              $or: [{ _id: userId }, { username }],
            });
      
            if (!foundUser) {
              throw new Error('Cannot find a user with this id or username');
            }
      
            return foundUser;
          },
    },
    Mutation: {
        // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)
        createUser: async (parent, { username, email, password }) => {
            const user = await User.create({
                username,
                email,
                password
            });
        
            if (!user) {
                throw new Error('Something is wrong!');
            }
            const token = signToken(user);
            res.json({ token, user });
          },
        // remove a book from `savedBooks`
        deletebook: async (parent, { bookId }, { user }) => {
            const updatedUser = await User.findOneAndUpdate(
              { _id: user._id },
              { $pull: { savedBooks: { bookId: bookId } } },
              { new: true }
            );
            if (!updatedUser) {
              throw new Error("Couldn't find user with this id!");
            }
            return updatedUser;
          },
        // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
        saveBook: async (parent, { book }, { user }) => {
            if (!user) {
                throw new Error('You must be authenticated to save a book');
            }

            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: user._id },
                    { $addToSet: { savedBooks: book } },
                    { new: true, runValidators: true }
                );
                return updatedUser;
            } catch (err) {
                console.log(err);
                throw new Error('Failed to save the book');
            }
        },
        login: async (parent, { email, username, password }) => {
            if (!email && !username) {
                throw new Error('Please provide either an email or a username');
            }

            // Find the user by email or username
            const user = await User.findOne({
                $or: [{ email }, { username }],
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Check if the provided password is correct
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                throw new Error('Invalid password');
            }

            // Create and sign a JWT token
            const token = jwt.sign(
                {
                    id: user._id,
                },
                'your_secret_key', // Replace with actual secret key
                { expiresIn: '1h' }
            );

            return {
                token,
                user,
            };
        },
    },
};

module.exports = resolvers;