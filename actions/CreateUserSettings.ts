"use server"

import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function CreateUserSettings(){
    const user = await currentUser()

    if(!user){
        redirect("/sign-in")
    }

   try {
    let userSettings = await prisma.userSettings.findUnique({
        where : {
            userId : user.id
        }
    })
    if(!userSettings){
        userSettings = await prisma.userSettings.create({
            data : {
                userId : user.id,
                currency : "TK"
            }
        })
    }
    revalidatePath("/")

    return userSettings
   } catch (error) {
    redirect("/wizard")
   }
}