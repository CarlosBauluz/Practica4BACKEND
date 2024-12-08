import { MongoClient } from 'mongodb';
import { ObjectId } from "mongodb"

import { users, usersdb, projects, projectsdb, tasks, tasksdb } from "./types.ts "

const url = Deno.env.get("URL");
if (!url){
  Deno.exit(1);
}

const client = new MongoClient(url);
const dbName = 'P4BACKEND';

await client.connect();
console.log('Connected successfully to server');
const db = client.db(dbName); 
const userscollection = db.collection<usersdb>('users');
const taskscollection = db.collection<tasksdb>('tasks');
const projectscollection = db.collection<projectsdb>('projects');

const handler = async(req:Request):Promise<Response> =>{
  const method = req.method;
  const url = new URL(req.url)
  const path = url.pathname

  if (method === "GET"){ 
    const param = url.searchParams
    if (path === "/users"){
      const todosusers = await userscollection.find().toArray()
      return new Response (JSON.stringify(todosusers))
    }else if (path === "/projects"){
      const todosprojects = await projectscollection.find().toArray()
      return new Response(JSON.stringify(todosprojects))
    }else if (path === "/tasks"){
      const todostasks = await taskscollection.find().toArray()
      return new Response (JSON.stringify(todostasks))
    }else if (path === "/tasks/by-project"){
      if (param.get("project_id")){
        const tareas = await taskscollection.find({projectid : param.get("project_id")?.toString()}).toArray()
        return new Response(JSON.stringify(tareas));
      }else{
        return new Response (JSON.stringify({error : "Path incorrecto"}))
      }
    }else if (path === "/projects/by-user"){
      if (param.get("user_id")){
        const projectos = await projectscollection.find({user_id : param.get("user_id")?.toString()}).toArray()
        return new Response(JSON.stringify(projectos));
      }else{
        return new Response (JSON.stringify({error : "param incorrecto"}))
      }
    }
    
  }else if (method === "POST"){
    const body = await req.json()
    if (path === "/users"){
      const {insertedId} = await userscollection.insertOne({
        name : body.name,
        email : body.email,
        created_at : new Date()
      })
      return new Response (JSON.stringify(await userscollection.findOne({_id : insertedId})))
    }else if (path === "/projects"){
      if (!await userscollection.findOne({_id : new ObjectId(body.user_id)})){
        return new Response (JSON.stringify({error : "User id not found"}))
      }
      const {insertedId} = await projectscollection.insertOne({
        name : body.name,
        description : body.description,
        start_date : body.start_date,
        user_id : body.user_id,
        end_date : body.end_date
      })
      return new Response (JSON.stringify(await projectscollection.findOne({_id : insertedId})))
    }else if (path === "/tasks"){
      if (!await projectscollection.findOne({_id : new ObjectId(body.projectid)})){
        return new Response (JSON.stringify({error : "Project id not found"}))
      }
      const {insertedId} = await taskscollection.insertOne({
        title : body.title,
        description : body.description,
        status : body.status,
        due_date : body.due_date,
        projectid : body.projectid,
        created_at : new Date()
      })
      return new Response (JSON.stringify(await taskscollection.findOne({_id : insertedId})))
    }else if (path === "/tasks/move"){
      if (!await taskscollection.findOne({projectid : body.origin_project_id})){
        return new Response (JSON.stringify({error : "Project id not found"}))
      }
      const {upsertedCount} = await taskscollection.updateOne({_id : new ObjectId(body.task_id)},{$set : {projectid : body.destination_project_id}})
      return new Response (JSON.stringify({
        message : "Task moved succesfully",
        task : {
          id : body.task_id,
          title: body.title,
          project_id : body.destination_project_id
        }
      }))
    }
    
    
  }else if (method === "PUT"){
    const body = await req.json()

  }else if (method === "DELETE"){
    const param = url.searchParams
    if (path === "/users"){
      if (param.get("id")){
        const {deletedCount} =  await userscollection.deleteOne({_id : new ObjectId(param.get("id")?.toString())})
        if (!deletedCount){
          return new Response (JSON.stringify({error : "User not found"}))
        }
        return new Response (JSON.stringify({message : "User deleted succesfully"}))
      }
      return new Response (JSON.stringify({error : "The param isn't correct"}))
    }else if (path === "/projects"){
      if (param.get("id")){
        const {deletedCount} =  await projectscollection.deleteOne({_id : new ObjectId(param.get("id")?.toString())})
        if (!deletedCount){
          return new Response (JSON.stringify({error : "Project not found"}))
        }
        return new Response (JSON.stringify({message : "Project deleted succesfully"}))
      }
      return new Response (JSON.stringify({error : "The param isn't correct"}))
    }else if (path === "/tasks"){
      if (param.get("id")){
        const {deletedCount} = await taskscollection.deleteOne({_id : new ObjectId(param.get("id")?.toString())})
        if (!deletedCount){
          return new Response (JSON.stringify({error : "Task not found"}))
        }
        return new Response (JSON.stringify({message : "Task deleted succesfully"}))
      }
      return new Response (JSON.stringify({error : "The param isn't correct"}))
    }
    
  }

  return new Response(JSON.stringify({error : "Method incorrecto"}))
}

Deno.serve({port : 3000}, handler)