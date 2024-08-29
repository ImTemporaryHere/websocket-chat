export enum TransportTopics {
  createGroup = "group.create.command",
  groupCreated = "group.created.event",
  userAddedToGroup = "user.added-to-group.event",
  sendGroupMessage = "group.send-message.command",
  groupMessageSent = "group.message-sent.event",
  removeGroup = "group.remove.command",
  groupRemoved = "group.removed.event",
}
