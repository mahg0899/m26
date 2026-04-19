export default function BugReport() {
    return (
        <div className="flex flex-col gap-2 mx-auto w-9/10 pt-15 md:pt-10">
            <h1>Informar de un error</h1>
            <p>Si encuentras un error, por favor infórmanos aquí. Puedes describir el error y adjuntar capturas de pantalla si es necesario.</p>
            <form action="" className="flex flex-col gap-2">
                <label htmlFor="error">Error</label>
                <textarea name="error" id="error" cols={30} rows={10} className="border border-gray-300 rounded-md p-2"></textarea>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Enviar</button>
            </form>
        </div>
    );
}