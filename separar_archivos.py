import os
import sys

def separar_archivos_html(nombre_archivo_fuente):
    """
    Lee un archivo de texto grande que contiene múltiples archivos HTML,
    los separa usando un delimitador y crea los archivos HTML individuales.
    """
    try:
        # Abre y lee todo el contenido del archivo fuente.
        # Se especifica utf-8 para manejar caracteres especiales como 'ñ' o tildes.
        with open(nombre_archivo_fuente, 'r', encoding='utf-8') as f:
            contenido_completo = f.read()
    except FileNotFoundError:
        print(f"Error: No se encontró el archivo '{nombre_archivo_fuente}'.")
        print("Asegúrate de que el archivo esté en la misma carpeta que este script.")
        return

    # El delimitador que usamos para separar los archivos en el texto.
    delimitador = '--- START OF FILE '
    
    # Separa el contenido en bloques, uno por cada archivo.
    # El primer elemento de la lista estará vacío, por eso lo descartamos con [1:].
    bloques = contenido_completo.split(delimitador)[1:]
    
    if not bloques:
        print("No se encontraron bloques de archivos para procesar en el archivo fuente.")
        return

    print(f"Se encontraron {len(bloques)} archivos para crear.")
    
    # Itera sobre cada bloque para crear el archivo correspondiente.
    for bloque in bloques:
        try:
            # Separa la primera línea (que contiene el nombre del archivo) del resto del contenido.
            partes = bloque.split('\n', 1)
            linea_de_nombre = partes[0]
            contenido_html = partes[1] if len(partes) > 1 else ''
            
            # Extrae el nombre del archivo del delimitador.
            nombre_archivo_destino = linea_de_nombre.replace('---', '').strip()
            
            if not nombre_archivo_destino:
                print("Advertencia: Se encontró un bloque sin nombre de archivo. Omitiendo.")
                continue

            # Escribe el contenido HTML en un nuevo archivo.
            with open(nombre_archivo_destino, 'w', encoding='utf-8') as f_destino:
                f_destino.write(contenido_html)
            
            print(f"-> Archivo creado: {nombre_archivo_destino}")

        except Exception as e:
            print(f"Ocurrió un error procesando un bloque: {e}")

    print("\n¡Proceso completado! Todos los archivos han sido generados.")


# Nombre del archivo que contiene todos los HTML.
nombre_fuente = "all_html_files.txt"
separar_archivos_html(nombre_fuente)