import * as React from "react";
import {useCallback, useState, useContext, useEffect} from "react";
import {Product} from "../product-list";
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import {makeStyles} from "@material-ui/core/styles";
import {useHttp} from "../Utils/use-http";
import useDebouncedCallback from "../Utils/use-debounced-callback";
import {MessagesContext, ErrorMessage, WarningMessage} from "../Utils/Message";

interface QueryResponse {
    errorType: ErrorType
    isError: boolean
    message: string
    success: boolean
}

enum ErrorType {
    INCORRECT_BODY,
    INCORRECT_TYPE,
    MISSING_PROPERTY,
    NOT_FOUND,
    INCORRECT_QUANTITY
}

enum Direction {
    Up,
    Down,
}

const useStyles = makeStyles({
    disable: {
        color: '#b5afaf',
    },
    progress: {
        textAlign: 'center'
    }
});


const Cart = (props: { min?: number, max?: number, price: string, isBlocked?: boolean, pid?: string, countCallback: (cost: number, pid: string) => void }) => {

    const classes = useStyles();
    const [count, setCount] = useState<number>(props.min ? props.min : 0);
    const {push} = useContext(MessagesContext);

    useEffect(() => {
        props.countCallback(count * parseFloat(props.price), props.pid);
    }, [count])

    const onClick = useDebouncedCallback(useCallback(async (direction: Direction) => {

        const json = JSON.stringify({
            'pid': props.pid,
            'quantity': count
        })

        try {
            const response = await fetch({
                body: new Blob([json], {type: 'text/plain'})
            })

            const queryResponse: QueryResponse = JSON.parse(response);

            if (queryResponse.success && !queryResponse.isError) {
                if (direction === Direction.Up) {
                    if (count < props.max) setCount(count + 1);
                    if (count === props.max) push(<WarningMessage message={`Została dodana maksymalna ilość produktu`}/>);
                }
                if (direction === Direction.Down) {
                    if ( count > props.min ) setCount(count - 1);
                    if ( count === props.min ) push(<WarningMessage message={`Minimalna ilość produktu to ${props.min}`}/>);
                }


            } else {
                setCount(props.min);
                push(<ErrorMessage message={`Błąd w trakcie dodawania produktu`}/>);
            }

        } catch (e) {
            setCount(props.min);
            push(<ErrorMessage message={`Błąd w trakcie dodawania produktu`}/>);
        }

    }, [count]), 200);

    const {fetch, loading, error} = useHttp<QueryResponse>({
        url: `/api/product/check`,
        method: 'POST',
        autoStart: false,
    });



    return (
        <div>
            <div>
                <AddIcon onClick={() => !props.isBlocked && onClick(Direction.Up)} className={props.isBlocked || count >= props.max ? classes.disable : ''}/>
                <RemoveIcon onClick={() => !props.isBlocked && onClick(Direction.Down)} className={props.isBlocked || count <= props.min ? classes.disable : ''}/>
            </div>

            <div>Obecnie masz {count} sztuk produktu</div>
        </div>
    );
}


export default Cart;