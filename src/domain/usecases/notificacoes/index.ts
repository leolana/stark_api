import { Sequelize } from 'sequelize-typescript';

import getNotificationsUseCase from './getNotificationsUseCase';
import updateNonReadUseCase from './updateNonReadUseCase';
import addNotificationUseCase from './addNotificationUseCase';
import getNotificationNonReadUseCase from './getNotificationNonReadUseCase';

export interface NotificationUseCases {
  getNotificatons?: typeof getNotificationsUseCase;
  updateNonRead?: typeof updateNonReadUseCase;
  addNotification?: typeof addNotificationUseCase;
  getNotificationNonRead?: typeof getNotificationNonReadUseCase;
}

export function getNotificationUseCases(
  db: Sequelize,
) {
  const usecases: NotificationUseCases = {};

  usecases.getNotificatons = getNotificationsUseCase;
  usecases.updateNonRead = updateNonReadUseCase;
  usecases.addNotification = addNotificationUseCase;
  usecases.getNotificationNonRead = getNotificationNonReadUseCase;

  return usecases;
}
