
namespace convert
{
    public static class StringExtensions
    {
        private static string Space = " ";
        public static string Arg(this string args, string arg)
        {
            return args + Space + arg;
        }
    }
}