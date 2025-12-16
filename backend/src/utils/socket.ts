import { Server } from 'socket.io';

let io: Server | null = null;

export const setSocketIO = (socketIO: Server) => {
  io = socketIO;
};

export const getSocketIO = (): Server | null => {
  return io;
};

export const emitToSeller = (sellerId: string, event: string, data: any) => {
  if (io) {
    console.log(`[SOCKET] Emitting '${event}' to seller room: seller-${sellerId}`, data);
    io.to(`seller-${sellerId}`).emit(event, data);
  }
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    console.log(`[SOCKET] Emitting '${event}' to user room: user-${userId}`, data);
    io.to(`user-${userId}`).emit(event, data);
  }
};

export const emitToRider = (riderId: string, event: string, data: any) => {
  if (io) {
    io.to(`rider-${riderId}`).emit(event, data);
  }
};

export const emitToAll = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
  }
};
