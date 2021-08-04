import * as React from "react";
import {useHttp} from "../Utils/use-http";
import {useCallback, useEffect, useState} from "react";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {CircularProgress} from "@material-ui/core";
import Cart from "../cart";

export interface Product {
    pid?: string,
    name?: string,
    price?: string,
    max?: number,
    min?: number,
    isBlocked?: boolean
}

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    progress: {
        textAlign: 'center'
    }
});



const ProductList = (props: {totalCall: (total: number) => void}) => {

    const classes = useStyles();
    const [products, setProducts] = useState<Product[]>([]);
    const [addedProducts, setAddedProducts] = useState<{ [key:string]:number }>(null)
    const [loader, setLoader] = useState<boolean>(true);
    const onLoad = useCallback((response: Product[]) => {
        setProducts(response)
        setLoader(false)
    }, [])

    useEffect(() => {

        addedProducts && props.totalCall(Object.values(addedProducts).reduce((sum, curr) => sum + curr));

    }, [addedProducts])

    useHttp<Product[]>({
        url: `/api/cart`,
        method: 'GET',
        onLoad
    });

    const countCallback = useCallback((cost: number, pid: string) => {
        setAddedProducts(prevState => {
            return {
                ...prevState,
                [pid]: cost
            }
        })
    }, [])

    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Nazwa</TableCell>
                        <TableCell align="right">Cena</TableCell>
                        <TableCell/>
                    </TableRow>
                </TableHead>
                <TableBody>
                {loader && <TableRow><TableCell className={classes.progress} colSpan={3}><CircularProgress/></TableCell></TableRow>}
                {!loader && products.map((row) => (
                        <TableRow key={row.name}>
                            <TableCell component="th" scope="row">
                                {row.name}
                            </TableCell>
                            <TableCell align="right">{row.price.replace('.', ',')}zł</TableCell>
                            <TableCell align="right">
                                <Cart min={row.min} max={row.max} pid={row.pid} price={row.price} isBlocked={row.isBlocked} countCallback={countCallback}/>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );


}

export default ProductList;