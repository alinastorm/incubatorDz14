import { Query } from 'mongoose';

// declare interface Query<T> {
//     toView(): Query<T>;
// }

Object.setPrototypeOf(Query,
    {
        toView: function () {
            return this.then(docs => {
                // Обработка данных
                return docs.map(doc => ({
                    id: doc._id,
                    // Другие поля
                }));
            });
        }
    })

// Query.prototype.toView = function() {
//     return this.then(docs => {
//       // Обработка данных
//       return docs.map(doc => ({
//         id: doc._id,
//         // Другие поля
//       }));
//     });
//   };