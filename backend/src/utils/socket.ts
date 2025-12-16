import { Server } from 'socket.io';

let io: Server | null = null;

export const setSocketIO = (socketIO: Server) => {
  io = socketIO;
};

export const getSocketIO = (): Server | null => {
  return io;
};

// Emit to specific buyer
export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    console.log(`[SOCKET] Emitting '${event}' to buyer room: user-${userId}`);
    io.to(`user-${userId}`).emit(event, data);
  }
};

// Emit to specific seller
export const emitToSeller = (sellerId: string, event: string, data: any) => {
  if (io) {
    console.log(`[SOCKET] Emitting '${event}' to seller room: seller-${sellerId}`);
    io.to(`seller-${sellerId}`).emit(event, data);
  }
};

// Emit to specific rider
export const emitToRider = (riderId: string, event: string, data: any) => {
  if (io) {
    console.log(`[SOCKET] Emitting '${event}' to rider room: rider-${riderId}`);
    io.to(`rider-${riderId}`).emit(event, data);
  }
};

export const emitToAll = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
  }
};
