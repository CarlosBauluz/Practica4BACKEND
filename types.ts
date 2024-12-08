import { ObjectId, OptionalId } from "mongodb";

export type users = {
    id : string,
    name : string,
    email : string,
    created_at: Date
} 

export type usersdb = OptionalId<{
    email : string,
    name : string,
    created_at : Date
}>


export type projects = {
    id : string,
    name : string,
    description : string,
    start_date : Date,
    end_date : Date|null,
    user_id : string,
}

export type projectsdb = OptionalId<{
    name : string,
    description : string,
    start_date : Date,
    end_date : Date|null,
    user_id : string,
}>


export type tasks = {
    id : string,
    title : string,
    description : string,
    status : "pending"| "in_progress"| "completed",
    created_at : Date,
    due_date : Date,
    projectid : string
}

export type tasksdb = OptionalId<{
    title : string,
    description : string,
    status : "pending"| "in_progress"| "completed",
    created_at : Date,
    due_date : Date,
    projectid : string
}>