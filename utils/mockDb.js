const mockDb = {
  orders: [],
  watchers: [], // Store multiple watchers

  collection(name) {
    if (name !== 'Orders') {
      throw new Error('Only "Orders" collection is supported in this mock.');
    }
    return {
      _collectionName: name, // Keep track of collection name for watcher
      where(conditions) {
        // In a real scenario, conditions would filter. Here, we'll pass them to the watcher.
        return {
          _conditions: conditions,
          watch: ({ onChange, onError }) => {
            const watcher = {
              id: Date.now() + Math.random(), // Simple unique ID
              conditions: conditions,
              onChange: onChange,
              onError: onError,
              intervalId: null,
              close: function() {
                clearInterval(this.intervalId);
                mockDb.watchers = mockDb.watchers.filter(w => w.id !== this.id);
                console.log(`Watcher ${this.id} closed.`);
              }
            };

            // Simulate initial data delivery for 'init'
            const initialDocs = mockDb.orders.filter(order =>
              Object.keys(conditions).every(key => conditions[key] === order[key])
            );
            if (initialDocs.length > 0) {
              const snapshot = {
                docChanges: initialDocs.map(doc => ({
                  type: 'init',
                  doc: { ...doc } // Return a copy
                }))
              };
              try {
                onChange(snapshot);
              } catch (e) {
                onError(e);
              }
            }

            watcher.intervalId = setInterval(() => {
              // Only proceed if there's a logged-in user with a storeId
              const userInfo = uni.getStorageSync('userInfo');
              if (!userInfo || !userInfo.storeId) {
                // console.log('MockDB: No user/storeId found, skipping new order simulation.');
                return;
              }

              const newOrder = {
                _id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                tableName: `A0${Math.floor(Math.random() * 10) + 1}`,
                status: 'pending', // New orders are pending
                storeId: userInfo.storeId, // Match the logged-in user's storeId
                items: [
                  { productId: `p00${Math.floor(Math.random() * 5) + 1}`, name: "测试菜品", price: Math.floor(Math.random() * 50) + 1000, quantity: 1 }
                ],
                totalAmount: Math.floor(Math.random() * 100) + 1000,
                createdAt: new Date().toISOString()
              };

              // Check if this new order matches the watcher's conditions
              const matchesConditions = Object.keys(watcher.conditions).every(key => {
                return watcher.conditions[key] === newOrder[key];
              });

              if (matchesConditions) {
                 // mockDb.orders.push(newOrder); // Add to internal list - not strictly needed for this simulation if not querying .orders directly
                const snapshot = {
                  docChanges: [{
                    type: 'add',
                    doc: newOrder
                  }]
                };
                try {
                  console.log('MockDB: Simulating new order for storeId:', newOrder.storeId, newOrder);
                  onChange(snapshot);
                } catch (e) {
                  onError(e);
                }
              }
            }, 15000); // Simulate a new order matching conditions every 15 seconds

            mockDb.watchers.push(watcher);
            console.log(`Watcher ${watcher.id} started with conditions:`, conditions);
            return watcher;
          }
        };
      }
    };
  },

  // Method to manually add orders, primarily for testing or specific scenarios
  // This will also attempt to trigger relevant watchers
  addOrder(order) {
    this.orders.push(order);
    console.log('MockDB: Manually added order:', order);
    this.watchers.forEach(watcher => {
      const matchesConditions = Object.keys(watcher.conditions).every(key => {
        return watcher.conditions[key] === order[key];
      });
      if (matchesConditions) {
        const snapshot = {
          docChanges: [{
            type: 'add',
            doc: { ...order } // Return a copy
          }]
        };
        try {
          watcher.onChange(snapshot);
        } catch (e) {
          if (watcher.onError) watcher.onError(e);
        }
      }
    });
  }
};

// For uni-app, global uni object might not be available at module definition time in all contexts.
// Ensure it's accessed when methods are called.

export default mockDb;
