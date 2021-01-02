const graphql = require('graphql');

const { 
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull // указывает, что поле/аргумент является обязательным параметром
} = graphql;

const Movies = require('../models/movies/movie');
const Directors = require('../models/directors/director');


const MovieType = new GraphQLObjectType({
    name: 'Movie',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: new GraphQLNonNull(GraphQLString)},
        genre: {type: new GraphQLNonNull(GraphQLString)},
        year: {type: new GraphQLNonNull(GraphQLString)},
        director: {
            type: DirectorType,
            resolve: (parent, args) => {
                return Directors.findById(parent.directorId); // findById и find методы библиотеки mongoose
            }
        }
    })
});

const DirectorType = new GraphQLObjectType({
    name: 'Director',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: new GraphQLNonNull(GraphQLString)},
        age: {type: new GraphQLNonNull(GraphQLInt)},
        movies: {
            type: new GraphQLList(MovieType),
            resolve: (parent, args) => {
                return Movies.find({directorId: parent.id});
            }
        }
    })
});


const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        movie: {
            type: MovieType,
            args: {id: {type: GraphQLID}},
            resolve: (parent, args) => {
                return Movies.findById(args.id); 
            }
        },
        director: {
            type: DirectorType,
            args: {id: {type: GraphQLID}},
            resolve: (parent, args) => {
                return Directors.findById(args.id);
            }
        },
        movies: {
            type: new GraphQLList(MovieType),
            resolve: () => {
                return Movies.find({}); // если необходимо вернуть список всех фильмов
            }
        },
        directors: {
            type: new GraphQLList(DirectorType),
            resolve: () => {
                return Directors.find({});
            }
        }
    }
});

const Mutation =  new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addDirector: {
            type: DirectorType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)},
            },
            resolve: (_, args) => {
                const director = new Directors({
                    name: args.name,
                    age: args.age
                });
                return director.save();
            }
        },
        addMovie: {
            type: MovieType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                genre: {type: new GraphQLNonNull(GraphQLString)},
                year: {type: new GraphQLNonNull(GraphQLString)},
                directorId: {type: GraphQLID}
            },
            resolve: (_, args) => {
                const movie = new Movies({
                    name: args.name,
                    genre: args.genre,
                    year: args.year,
                    directorId: args.directorId
                });
                return movie.save();
            }
        },
        deleteDirector: {
            type: DirectorType,
            args: {
                id: {type: GraphQLID},
            },
            resolve: (parent, args) => {
                return Directors.findByIdAndDelete(args.id);
            }
        },
        deleteMovie: {
            type: MovieType,
            args: {
                id: {type: GraphQLID},
            },
            resolve: (parent, args) => {
                return Movies.findByIdAndDelete(args.id);
            }
        },
        updateDirector: {
            type: DirectorType,
            args: {
                id: {type: GraphQLID},
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                return Directors.findByIdAndUpdate(
                    args.id,
                    { $set: { name: args.name, age: args.age}},
                    { new: true }
                );
            }
        },
        updateMovie: {
            type: MovieType,
            args: {
                id: {type: GraphQLID},
                name: {type: new GraphQLNonNull(GraphQLString)},
                genre: {type: new GraphQLNonNull(GraphQLString)},
                year: {type: new GraphQLNonNull(GraphQLString)},
                directorId: {type: GraphQLString}
            },
            resolve: (parent, args) => {
                return Movies.findByIdAndUpdate(
                    args.id,
                    { $set: { name: args.name, genre: args.genre, year: args.year, directorId: args.directorId }},
                    { new: true }
                );
            }
        }
    }

});

module.exports = new GraphQLSchema({
    query: Query,
    mutation: Mutation
});