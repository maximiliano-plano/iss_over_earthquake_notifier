
export default abstract class NotificationQueueProvider {
    abstract publish(notification: Notification): Promise<boolean>
    abstract subscribe(): Promise<Notification>
}