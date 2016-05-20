import { Mongo } from 'meteor/mongo';
export const Pairs = new Meteor.Collection('pairs');

export const OnlinePlayers = new Meteor.Collection('onlinePlayers');
export const Score = new Meteor.Collection('scores');