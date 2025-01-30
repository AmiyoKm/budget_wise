"use client"
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { TransactionType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { PlusSquare, TrashIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import { GetCategories } from "@/actions/GetCategories";
import CreateCategoryDialog from "../../_components/CreateCategoryDialog";
import DeleteCategoryDialog from "./DeleteCategoryDialog";
import {
    Card,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";



export function CategoryList({ type }: { type: TransactionType }) {
    const categoryQuery = useQuery({
      queryKey: ["categories", type],
      queryFn: () => GetCategories(type),
    });
  
    const dataAvailable = categoryQuery.data && categoryQuery.data.length > 0
    
    return (
      <SkeletonWrapper isLoading={categoryQuery.isLoading}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {type === "expense" ? (
                  <TrendingDown className="h-12 w-12 items-center rounded-lg bg-red-400/10 p-2 stroke-red-500" />
                ) : (
                  <TrendingUp className="h-12 w-12 items-center rounded-lg bg-emerald-400/10 p-2 stroke-emerald-500" />
                )}{" "}
                <div>
                  {type === "income" ? "Income" : "Expense"}
                  <div className="text-sm text-muted-foreground">
                    Sorted by name
                  </div>
                </div>
              </div>
  
              <CreateCategoryDialog
                type={type}
                successCallback={() => categoryQuery.refetch()}
                trigger= {
                  <Button className="gap-2 text-sm">
                      <PlusSquare className="h-4 w-4" />
                      Create category
                  </Button>
                }
              />
            </CardTitle>
          </CardHeader>
          <Separator />
          {
              !dataAvailable && (
                  <div className="flex h-40 w-full flex-col items-center justify-center">
                      <p className="text-2xl">No <span className={cn("m-1" , type ==="income" ? "text-emerald-500" : "text-red-500")}>{type}</span>
                      categories yet
                      </p>
                     
                  </div>
              )
          }
          {
              dataAvailable && (
                  <div className="grid grid-flow-row gap-2 p-2 sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {
                          categoryQuery.data.map((category : Category)=>(
                              <CategoryCard category={category} key={category.name} />
                          ))
                      }
                  </div>
              )
          }
        </Card>
      </SkeletonWrapper>
    );
  }
  
  function CategoryCard({category } : {category: Category}){
      return (
          <div className="flex border-separate flex-col justify-between rounded-md border shadow-md shadow-black/[0.1] dark:shadow-white/[0.1] c">
              <div className="flex flex-col items-center gap-2 p-4">
                  <span className="text-3xl" role="img">
                      {category.icon}
                  </span>
                  <span>{category.name}</span>
              </div>
              <DeleteCategoryDialog category={category} trigger={
                    <Button className="flex w-full border-separate items-center gap-2 rounded-t-none text-muted-foreground hover:bg-red-500/20 cursor pointer" variant={"secondary"}>
                    <TrashIcon className="h-4 w-4" />
                    Remove
                </Button>
              } />
            
          </div>
      )
  }