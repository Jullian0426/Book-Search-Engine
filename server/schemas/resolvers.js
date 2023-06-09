// import user model
const { User } = require('../models');

// import sign token function from auth
const { signToken } = require('../utils/auth');
const bcrypt = require('bcrypt')

const resolvers = {
    Query: {
        // Your query resolvers here
        me: async (parent, args, { user }) => {
            if (user) {
                const userData = await User.findOne({ _id: user._id })
                    .select('-__v -password')
                    .populate('savedBooks');
        
                console.log('userData in me resolver:', userData);
                return userData;
              }
            throw new Error('Not logged in')
          },
    },
    Mutation: {
        // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({
                username,
                email,
                password
            });
        
            if (!user) {
                throw new Error('Something is wrong!');
            }
            const token = signToken(user);
            return {
                token,
                user,
            };
          },
        // remove a book from `savedBooks`
        deleteBook: async (parent, { bookId }, { user }) => {
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
            console.log('Context in saveBook resolver:', user);
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
            const token = signToken(user);

            return {
                token,
                user,
            };
        },
    },
};

module.exports = resolvers;