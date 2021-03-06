﻿using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;

namespace convert
{
    class Program
    {
        static string rawDirectory = @"..\data";
        static string convertedDirectory = @"..\converted";
        static string toolPath = @"..\tools";
        static int FBStickerWidth = 120;
        static int FBStickerHeight = 120;
        static string backgroundColor = "white";

        static void Main(string[] args)
        {
            rawDirectory = args[0];
            convertedDirectory = args[1];
            toolPath = args[2];
            FBStickerWidth = int.Parse(args[3]);
            FBStickerHeight = int.Parse(args[4]);
            backgroundColor = args[5];

            string[] fileNames = Directory.GetFiles(rawDirectory)
                .Select(x => Path.GetFileNameWithoutExtension(x))
                .ToArray();
            
            foreach (var fileName in fileNames)
            {
                WritePngToGif(fileName);
                WriteFBStickerSizedGif(fileName);
            }
        }

        static void ConvertPngsToGifs(string[] fileNames)
        {
            foreach (var fileName in fileNames)
            {
                WritePngToGif(fileName);
            }
        }

        static void WritePngToGif(string fileName)
        {
            var sourcePath = $@"{rawDirectory}\{fileName}.png";
            var destinationPath = $@"{convertedDirectory}\{fileName}.gif";
            Process.Start(
                $@"{toolPath}\apng2gif\apng2gif.exe", 
                $@"{sourcePath}"
                .Arg($"{destinationPath}")).WaitForExit();
        }

        static void WriteFBStickerSizedGif(string fileName)
        {
            var sourcePath = $@"{convertedDirectory}\{fileName}.gif";
            var destinationPath = $@"{convertedDirectory}\{fileName}.gif";

            int longerEdgeLength = 0;
            using (var image = Image.FromFile(sourcePath))
            {
                longerEdgeLength = image.Width > image.Height ? image.Width : image.Height;
            }
            Process.Start(
                $@"{toolPath}\ImageMagickCLI\magick.exe", 
                $@"{sourcePath}"
                .Arg("-coalesce")
                .Arg("-loop 0")
                .Arg($"-background {backgroundColor}")
                .Arg("-gravity center")
                .Arg($"-extent {longerEdgeLength}x{longerEdgeLength}")
                .Arg($"-scale {FBStickerWidth}x{FBStickerHeight}")
                .Arg("-layers optimize")
                .Arg($"{destinationPath}"));
        }
    }
}
