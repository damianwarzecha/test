import * as React from 'react';
import {SnackbarContent, useTheme} from "@material-ui/core";
import {SnackbarContentProps} from "@material-ui/core/SnackbarContent";
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import {CSSProperties, memo, PropsWithChildren, useMemo, useState} from "react";
import Id from "./Id";

export interface PushMessage {
    (message: JSX.Element, params?: { autoHideDuration?: number }): void
}

interface ContextValue {
    push: PushMessage
}

export const MessagesContext = React.createContext<ContextValue>(null);

export default function Message(props: SnackbarContentProps & { background: string, icon: JSX.Element }) {
    const style = useMemo(() => ({
        container: {
            marginBottom: '1em',
            background: props.background,
        },
        message: {
            display: 'flex',
            alignItems: 'center',
        },
        icon: {
            marginRight: '.25em',
            lineHeight: '1em',
        },
    }), [props.background]);

    return <SnackbarContent style={style.container} {...props} message={<div style={style.message}><span style={style.icon}>{props.icon}</span>{props.message}</div>}/>
}

export function ErrorMessage(props: SnackbarContentProps) {
    const theme = useTheme();

    return <Message background={theme.palette.error.dark} icon={<ErrorIcon/>} {...props}/>
}

export function WarningMessage(props: SnackbarContentProps) {
    return <Message background={'#777777'} icon={<WarningIcon/>} {...props}/>
}

export function SuccessMessage(props: SnackbarContentProps) {
    return <Message background={'green'} icon={<CheckCircleIcon/>} {...props}/>
}

export const MessagesProvider = memo(function MessagesProvider(props: PropsWithChildren<{}>) {
    const id = useMemo(() => new Id(), []);
    const [messages, setMessages] = useState<JSX.Element[]>([]);
    const value: ContextValue = useMemo(() => ({
        push: (message, params = {}) => {
            const props: SnackbarContentProps = message.props;

            if (!props.message) {
                return;
            }
            message = <span key={id.get()}>{message}</span>;
            params = {
                autoHideDuration: 6000,
                ...params
            };
            setMessages(messages => [...messages, message]);
            id.increment();

            if (params.autoHideDuration) {
                setTimeout(() => removeMessage(message), params.autoHideDuration);
            }
        }
    }), []);
    const removeMessage = (message: JSX.Element) => setMessages(messages => {
        return messages.filter(item => item !== message);
    });
    const style = useMemo<{ [propName: string]: CSSProperties }>(() => ({
        container: {
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            position: 'fixed',
            zIndex: 10000,
        },
    }), []);

    return <MessagesContext.Provider value={value}>
        <div style={style.container}>
            {messages}
        </div>
        {props.children}
    </MessagesContext.Provider>;
});