"use client"
import { DeleteTransaction } from '@/actions/DeleteTransaction'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,  } from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { SetStateAction } from 'react'
import { toast } from 'sonner'
interface Props {
    open : boolean
    setOpen : React.Dispatch<SetStateAction<boolean>>
    transactionId  : string
}
const DeleteTransactionDialog = ({open , setOpen , transactionId} : Props) => {
    const queryClient= useQueryClient()
    const deleteMutation = useMutation({
        mutationKey : ["transaction" ],
        mutationFn : DeleteTransaction,
        onSuccess :async ()=>{
            toast.success("Transaction deleted successfully", {
                id : "transactionId"
            })
            await queryClient.invalidateQueries({
                queryKey : ["transaction"]
            })
        },
        onError :()=>{
            toast.error("Something went wrong", {id : "transactionId"})
        }
    }) 
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>

        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone. This will permanently delete your transaction</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className={buttonVariants({
                    variant : "destructive"
                })} onClick={()=>{
                    toast.loading("Deleting category..." ,{
                        id :  "transactionId"
                    } )
                    deleteMutation.mutate(transactionId)
                }}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteTransactionDialog