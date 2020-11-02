https://github.com/umlaeute/v4l2loopback



sudo modprobe v4l2loopback devices=1 video_nr=10 card_label="OBS Cam" exclusive_caps=1



ffmpeg -stream_loop -1 -re -i pr-6873.webm.gif -f v4l2 -vcodec rawvideo -pix_fmt yuv420p /dev/video10


ffmpeg -f x11grab -s 640x480 -i :1.0+100,200 -f v4l2 /dev/video10


ffmpeg -f x11grab -s 640x480 -i :1.0+100,200 -vcodec rawvideo -pix_fmt yuv420p test.mp4




ffmpeg -f x11grab -framerate 25 -video_size cif -i :0.0+10,20 out.mpg



ffmpeg -f x11grab -show_region 1 -region_border 10 -framerate 25 -video_size 1920x1080 -i :1.0+960,260 out.mpg

ffmpeg -f x11grab -show_region 1 -region_border 10 -framerate 25 -video_size 1920x1080 -i :1.0+960,260 out.gif


