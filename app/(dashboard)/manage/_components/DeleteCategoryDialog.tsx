"use client"

import { DeleteCategory } from '@/actions/DeleteCategory'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { TransactionType } from '@/lib/types'
import { Category } from '@/prisma/generate/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { ReactNode } from 'react'
import { toast } from 'sonner'
interface Props {
    trigger : ReactNode ,
    category : Category
}
const DeleteCategoryDialog = ({trigger ,category} :Props) => {
    const categoryIdentifier = `${category.name}-${category.type}` 
    const queryClient= useQueryClient()
    const deleteMutation = useMutation({
        mutationKey : ["deleteCategory" ],
        mutationFn : DeleteCategory,
        onSuccess :async ()=>{
            toast.success("Category deleted successfully", {
                id : "categoryIdentifier"
            })
            await queryClient.invalidateQueries({
                queryKey : ["categories"]
            })
        },
        onError :()=>{
            toast.error("Something went wrong", {id : "categoryIdentifier"})
        }
    }) 
  return (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            {trigger}
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone. This will permanently delete your category</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className={buttonVariants({
                    variant : "destructive"
                })} onClick={()=>{
                    toast.loading("Deleting category..." ,{
                        id :  "categoryIdentifier"
                    } )
                    deleteMutation.mutate({
                        name : category.name,
                        icon : category.icon,
                        type :category.type as TransactionType
                    })
                }}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteCategoryDialog