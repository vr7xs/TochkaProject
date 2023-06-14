video_signature = ['66 74 79 70 4D 53 4E 56', '66 74 79 70 69 73 6F 6D', '66 74 79 70 6D 70 34 32',
                   '00 00 01 B3', '00 00 01 BA']
image_signature = ['FF D8 FF E0', '49 46 00 01', '89 50 4E 47 0D 0A 1A 0A', 'FF D8 FF DB', 'FF D8 FF E0 00 10 4A 46',
                   '69 66 00 00', '49 46 00 01']


def check_file_signature(file):
    content_type = file.content_type
    if 'video' in content_type:
        signatures = video_signature
    else:
        signatures = image_signature
    file.file.seek(0)
    data = file.file.read(16)
    hex_bytes = ' '.join(['{:02X}'.format(byte) for byte in data])
    for signature in signatures:
        if signature in hex_bytes:
            return True
    return False
