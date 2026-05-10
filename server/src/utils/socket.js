import { Server } from 'socket.io';

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'], credentials: true },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join', ({ role, userId, adminId }) => {
      if (role === 'admin') socket.join(`admin:${userId}`);
      else if (role === 'employee') {
        socket.join(`employee:${userId}`);
        if (adminId) socket.join(`admin:${adminId}:employees`);
      }
    });

    socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
  });

  return io;
}

export const getIO = () => { if (!io) throw new Error('Socket.io not initialized'); return io; };
export const emitSaleNew = (adminId, data) => io?.to(`admin:${adminId}`).emit('sale:new', data);
export const emitSaleUpdated = (employeeId, data) => io?.to(`employee:${employeeId}`).emit('sale:updated', data);
export const emitEmployeePending = (adminId, data) => io?.to(`admin:${adminId}`).emit('employee:pending', data);
